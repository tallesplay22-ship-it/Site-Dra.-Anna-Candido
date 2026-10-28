# Portfólio — Dra. Anna Flávia Candido

Site responsivo de apresentação e solicitação de consultas veterinárias. O formulário grava cada solicitação em SQLite e abre uma conversa do WhatsApp com a mensagem preenchida para a clínica.

## Estrutura

- `frontend/`: HTML, CSS e JavaScript do site.
- `backend/server.js`: inicialização do servidor.
- `backend/src/config/`: variáveis de ambiente, banco de dados e cabeçalhos de segurança.
- `backend/src/controllers/`: validação e processamento dos agendamentos.
- `backend/src/middlewares/`: limite de requisições, validação de origem e tratamento de erros.
- `backend/src/models/`: acesso ao banco de dados.
- `backend/src/routes/`: endpoints da API.
- `backend/data/`: banco SQLite local (não é servido pelo site nem incluído no Git).

## Inicializar o backend e abrir o site

O frontend é servido pelo backend Express. Para rodar localmente, não é necessário iniciar um servidor separado para a pasta `frontend`.

### Pré-requisitos

- Instale o Node.js **22.5 ou superior**; essa versão inclui o SQLite usado pelo projeto.
- Tenha o npm instalado junto com o Node.js.
- Para enviar o pedido à doutora, tenha WhatsApp ou WhatsApp Web disponível no navegador.

Confira as versões em um terminal:

```sh
node --version
npm --version
```

### Primeira execução

1. Abra um terminal na pasta raiz do projeto, a mesma que contém `README.md`, `frontend/` e `backend/`.
2. Na primeira vez, instale as dependências do projeto:

   ```sh
   npm install
   ```

   Essa instalação inicial é necessária; depois, para iniciar o site, basta usar `npm run dev`.

3. Inicie o backend e o frontend juntos:

   ```sh
   npm run dev
   ```

4. Quando aparecer a mensagem `Site disponível em http://127.0.0.1:3000`, abra este endereço no navegador:

   [http://localhost:3000](http://localhost:3000)

Mantenha o terminal aberto enquanto usa o site. Para encerrar o backend, volte ao terminal e pressione **Ctrl+C**.

### Configuração local opcional

Sem arquivo de configuração, o backend usa a porta `3000` e fica disponível apenas neste computador. Se quiser definir esses valores, crie `backend/.env` copiando `backend/.env.example`.

No PowerShell, na raiz do projeto:

```powershell
Copy-Item backend\.env.example backend\.env
```

O arquivo de exemplo define:

```env
# PORT=3000
HOST=127.0.0.1
APP_ORIGIN=http://localhost:3000
```

Normalmente, não é preciso alterar esse arquivo. Se a porta `3000` já estiver ocupada, `npm run dev` tenta automaticamente as portas seguintes e informa no terminal o endereço correto. Para escolher uma porta manualmente, remova o `#` de `PORT`, defina o número desejado e acesse o endereço mostrado ao iniciar o servidor.

### Rodar em modo de desenvolvimento e executar testes

O comando `npm run dev` já inicia o servidor com reinicialização automática quando os arquivos do backend mudarem. Não abra `frontend/index.html` diretamente e não inicie outro servidor de frontend: o backend entrega os arquivos e a API pela mesma porta.

Para iniciar o servidor sem modo de desenvolvimento:

```sh
npm start
```

Para executar os testes de validação do backend:

```sh
npm test
```

### Solução de problemas

- **“Porta já está em uso”**: feche o outro processo que está usando a porta ou altere `PORT` em `backend/.env`; se configurou `APP_ORIGIN`, ajuste-a para a mesma porta.
- **Erro de versão do Node.js ou SQLite**: instale Node.js 22.5 ou superior e abra um terminal novo.
- **O site não abre**: confirme que o comando `npm run dev` continua rodando e acesse o endereço e a porta indicados no terminal.
- **O navegador não abre o WhatsApp**: permita o redirecionamento; a mensagem fica preenchida, mas é preciso pressionar **Enviar** no WhatsApp para concluir o contato.

Em produção, configure `NODE_ENV=production`, `APP_ORIGIN` com a URL HTTPS pública e `HOST=0.0.0.0` somente se o provedor exigir que o servidor aceite conexões externas. Se houver proxy reverso, informe em `TRUST_PROXY` somente o número de saltos ou os IPs/CIDRs dos proxies confiáveis; não use `true` nem confie em proxies desconhecidos.

O banco salva somente a data e o horário reservados, sem guardar nome, telefone, nome do pet ou observações. Na primeira inicialização após esta atualização, os dados pessoais que estavam no formato antigo são removidos; os horários reservados são mantidos. O site não oferece endpoint para consultar os agendamentos e o banco fica fora da pasta pública. O formulário oferece horários de segunda a sexta, das 9h às 17h, impede horários passados e bloqueia a reserva duplicada do mesmo horário. Após salvar a solicitação, o site abre uma conversa com o número `+55 32 99143-9408` e preenche uma mensagem com os dados do pet e o horário desejado. A pessoa precisa tocar em **Enviar** no WhatsApp; o horário só é confirmado pela clínica após contato com o responsável.

O backend também limita o tamanho dos pedidos e a frequência de requisições, verifica a origem de pedidos de agendamento, usa cabeçalhos de segurança/CSP e retorna mensagens genéricas para erros internos sem registrar dados pessoais nos logs. O limitador de frequência usa memória local; em uma implantação com várias instâncias, configure um armazenamento compartilhado para que o limite também seja compartilhado. Em sistemas POSIX, o diretório e o arquivo SQLite recebem permissões restritas. Essas medidas reduzem riscos, mas não garantem segurança absoluta: em produção use HTTPS, mantenha Node.js e dependências atualizados, restrinja acesso ao servidor e às cópias de segurança, proteja o arquivo `backend/.env` e configure corretamente o proxy e o firewall. Como a migração remove dados pessoais do banco atual, exclua também cópias antigas do banco que ainda possam conter esses dados.

## Personalização

O texto e as informações de apresentação estão em `frontend/index.html`; cores e layout em `frontend/styles.css`. O retrato da seção “Sobre mim” fica em `frontend/images/dra-anna-candido.png`. Confirme horários, serviços e informações profissionais com a doutora antes de publicar.
