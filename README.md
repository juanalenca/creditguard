# CreditGuard AI

Plataforma Web Analítica para Recuperação de Crédito e Prevenção de Inadimplência. 
Projeto desenvolvido para a disciplina universitária visando monitoramento financeiro, análise de inadimplência e classificação de risco (Semana 2).

## 🚀 Tecnologias

- **Frontend:** React, Vite, TailwindCSS, Recharts
- **Backend:** Node.js, Express, pg (PostgreSQL)
- **Dados:** Python, Pandas, Faker
- **Banco de Dados:** PostgreSQL

---

## 🛠️ Passo a Passo para Configurar o Banco de Dados (Windows)

Siga os passos abaixo para preparar o banco de dados na sua máquina local antes de rodar o projeto.

### 1. Iniciar o PostgreSQL no Windows
1. Aperte `Win + R`
2. Digite: `services.msc`
3. Procure algo parecido com: `postgresql-x64-17` ou `postgresql-x64-16`
4. **Status esperado:** `Running / Em execução`
5. Se estiver parado: Clique com o botão direito e selecione **Iniciar**.

### 2. Abrir o pgAdmin
1. Abra o **pgAdmin 4**.
2. Na primeira vez ele pede a `master password`. *Essa senha NÃO é a senha do banco, é apenas uma senha local do pgAdmin.*
3. No menu lateral esquerdo, clique em **Servers** para expandir.
4. Ele vai pedir a senha do PostgreSQL (geralmente definida na instalação, como `postgres` ou `admin`). Se conectar, sucesso!

### 3. Criar o Banco de Dados
1. No menu lateral, clique com o botão direito em **Databases**.
2. Vá em **Create → Database**.
3. No campo **Database**, digite: `creditguard`
4. Clique em **Save**.

### 4. Executar o `schema.sql` (Estrutura)
1. Clique no banco `creditguard` que você acabou de criar.
2. No menu superior, clique em **Tools → Query Tool** (vai abrir o editor SQL).
3. Abra o arquivo `database/schema.sql` do repositório no Bloco de Notas ou VS Code.
4. Copie todo o conteúdo e cole no Query Tool.
5. Clique no botão **Execute Script** (ou aperte `F5`).
6. Se tudo deu certo, vai aparecer: `Query returned successfully`.

### 5. Executar o `seed.sql` (Mock Data)
1. Ainda no Query Tool (ou abrindo um novo), abra o arquivo `database/seed.sql` do repositório.
2. Copie e cole todo o conteúdo.
3. Clique em **Execute Script**.
   *(Obs: Esse arquivo tem cerca de 359KB, então pode demorar alguns segundos).*
4. Se terminar sem erro, o banco foi perfeitamente populado.

### 6. Verificar se os Dados Existem
1. No menu lateral do pgAdmin, vá em:
   `creditguard → Schemas → public → Tables`
2. Você deve ver as tabelas: `alertas_risco`, `clientes`, `contratos`, `pagamentos`, `usuarios`.
3. Clique com o botão direito em qualquer tabela (ex: `clientes`) e selecione **View/Edit Data → All Rows**.
4. Se aparecerem os registros falsos, funcionou perfeitamente!

---

## 💻 Como Rodar a Aplicação

### 1. Iniciar a API (Backend)
No terminal da raiz do projeto:
```bash
cd backend
npm install
npm run start 
# ou 'node src/server.js'
```
*A API estará rodando em `http://localhost:5000`*

### 2. Iniciar o Painel (Frontend)
Em um novo terminal na raiz do projeto:
```bash
cd frontend
npm install
npm run dev
```
*O Dashboard abrirá no navegador.*
