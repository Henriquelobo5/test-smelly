# Análise de Eficácia de Testes com Teste de Mutação

![PUC Minas](https://www.pucminas.br/Style%20Library/IMAGES/logoPuc.png)

**Pontifícia Universidade Católica de Minas Gerais**  
Campus Coração Eucarístico

**Disciplina:** Teste de Software  
**Trabalho:** Análise de Eficácia de Testes com Teste de Mutação  
**Aluno:** Henrique Lobo (808840)  
**Orientador:** Prof. Dr. Cleiton Tavares

---

## Análise de Test Smells

### 1. Lógica Condicional em Testes (Conditional Test Logic)
**Localização:** Teste "deve desativar usuários se eles não forem administradores"

```javascript
for (const user of todosOsUsuarios) {
  const resultado = userService.deactivateUser(user.id);
  if (!user.isAdmin) {
    expect(resultado).toBe(true);
    // ...
  } else {
    expect(resultado).toBe(false);
  }
}
```

**Por que é um smell?**  
A presença de estruturas condicionais (if/else) e loops em testes é considerada um mau cheiro porque:
- Torna o teste mais complexo e difícil de entender
- Pode ocultar falhas em cenários específicos
- Viola o princípio de que cada teste deve verificar um único cenário

**Riscos:**
- Testes que passam parcialmente podem mascarar problemas
- Dificuldade de manutenção e debugging
- Menor clareza sobre qual cenário específico falhou

### 2. Teste Frágil (Fragile Test)
**Localização:** Teste "deve gerar um relatório de usuários formatado"

```javascript
const linhaEsperada = `ID: ${usuario1.id}, Nome: Alice, Status: ativo\n`;
expect(relatorio).toContain(linhaEsperada);
expect(relatorio.startsWith('--- Relatório de Usuários ---')).toBe(true);
```

**Por que é um smell?**  
O teste é considerado frágil porque:
- Depende da formatação exata do texto, incluindo espaços e quebras de linha
- Qualquer mudança no formato do relatório, mesmo que não afete a funcionalidade, quebrará o teste

**Riscos:**
- Falsos negativos (testes falham mesmo quando a funcionalidade está correta)
- Alto custo de manutenção
- Resistência a refatorações legítimas

### 3. Tratamento Inadequado de Exceções (Improper Exception Handling)
**Localização:** Teste "deve falhar ao criar usuário menor de idade"

```javascript
try {
  userService.createUser('Menor', 'menor@email.com', 17);
} catch (e) {
  expect(e.message).toBe('O usuário deve ser maior de idade.');
}
```

**Por que é um smell?**  
O padrão try/catch usado desta forma é problemático porque:
- Não garante que a exceção realmente foi lançada
- O teste passa silenciosamente se nenhuma exceção for lançada
- Não segue as boas práticas do Jest para teste de exceções

**Riscos:**
- Falsos positivos (teste passa mesmo quando deveria falhar)
- Comportamentos inesperados podem passar despercebidos
- Dificulta o entendimento da intenção do teste

## Processo de Refatoração

### Antes (Código Original)
```javascript
test('deve desativar usuários se eles não forem administradores', () => {
  const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);
  const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

  const todosOsUsuarios = [usuarioComum, usuarioAdmin];

  for (const user of todosOsUsuarios) {
    const resultado = userService.deactivateUser(user.id);
    if (!user.isAdmin) {
      expect(resultado).toBe(true);
      const usuarioAtualizado = userService.getUserById(user.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    } else {
      expect(resultado).toBe(false);
    }
  }
});
```

### Depois (Código Refatorado)
```javascript
describe('deactivateUser', () => {
  test('should deactivate non-admin user', () => {
    // Arrange
    const regularUser = userService.createUser('Regular', 'regular@example.com', 30);

    // Act
    const result = userService.deactivateUser(regularUser.id);

    // Assert
    expect(result).toBe(true);
    expect(userService.getUserById(regularUser.id).status).toBe('inativo');
  });

  test('should not deactivate admin user', () => {
    // Arrange
    const adminUser = userService.createUser('Admin', 'admin@example.com', 40, true);

    // Act
    const result = userService.deactivateUser(adminUser.id);

    // Assert
    expect(result).toBe(false);
    expect(userService.getUserById(adminUser.id).status).toBe('ativo');
  });
});
```

### Decisões de Refatoração

1. **Separação de Cenários**
   - Dividimos o teste original em dois testes distintos
   - Cada teste agora foca em um cenário específico (usuário comum e admin)
   - Eliminou-se a necessidade de lógica condicional

2. **Padrão AAA (Arrange-Act-Assert)**
   - Estruturação clara das seções do teste
   - Melhor legibilidade e manutenibilidade
   - Facilita o entendimento do propósito do teste

3. **Nomes Descritivos**
   - Nomes dos testes mais claros e específicos
   - Descrição exata do comportamento esperado
   - Documentação mais efetiva do código

## Relatório da Ferramenta

A primeira execução do ESLint revelou vários problemas na suíte de testes original:

```bash
ESLint: 9.39.0

Warning: Test has too many assertions (jest/max-expects)
Warning: Conditional test logic detected (jest/no-conditional-test-expect)
Warning: Test title is too vague (jest/valid-title)
Error: Skipped test detected (jest/no-disabled-tests)
```

A ferramenta automatizou a detecção dos test smells de várias formas:
- Identificou uso de lógica condicional em testes
- Alertou sobre testes muito complexos (muitas assertions)
- Destacou testes desabilitados
- Sugeriu melhorias nos nomes dos testes

## Conclusão

Este trabalho demonstrou a importância crítica da qualidade na escrita de testes automatizados. Através da identificação e correção de test smells, foi possível transformar uma suíte de testes problemática em um conjunto de testes mais robusto, legível e manutenível.

A utilização de ferramentas de análise estática, como o ESLint com plugins específicos para testes, mostrou-se fundamental no processo de melhoria contínua do código. Estas ferramentas não apenas identificam problemas, mas também educam os desenvolvedores sobre boas práticas de teste.

Principais aprendizados:
1. Testes limpos são tão importantes quanto código limpo
2. Ferramentas de análise estática são essenciais para manter a qualidade
3. Refatoração constante é necessária para evitar degradação dos testes
4. Testes bem escritos servem como documentação viva do código

A experiência reforçou que investir tempo na qualidade dos testes não é apenas uma questão de boas práticas, mas um investimento fundamental na sustentabilidade e manutenibilidade do software a longo prazo.