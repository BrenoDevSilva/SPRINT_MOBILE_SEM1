📊 Datarium – Dados que pensam, investimentos que crescem!

Datarium é um aplicativo que **simula** um assessor virtual de investimentos inteligente, desenvolvido como parte do desafio da disciplina de Desenvolvimento Mobile e IoT em parceria com a XP Inc. Nosso objetivo é oferecer recomendações personalizadas de carteiras de investimento com base no perfil de risco, objetivos e preferências do usuário, tudo isso em um aplicativo moderno, responsivo e fácil de usar.

🚀 Funcionalidades

* 📋 **Cadastro e login local** com persistência via AsyncStorage
* 🧭 **Onboarding inteligente** para definição do perfil de investidor
* 📈 **Dashboard** com visão geral do mercado e perfil do usuário
* 💼 **Carteira recomendada** com:
    * Gráfico em pizza
    * Lista de ativos
    * Tags de liquidez, risco e ESG
    * Justificativas didáticas
* 📚 **Tela de explicações dos ativos** com linguagem acessível
* 🕓 **Histórico e acompanhamento** da evolução do perfil
* ⚙️ **Menu de configurações** com edição de perfil, LGPD e suporte
* 📱 **Design responsivo** com navegação fluida via React Navigation

🧠 Tecnologias e Conceitos Utilizados

* React Native com Expo
* TypeScript
* AsyncStorage para persistência local
* React Navigation (Stack + Bottom Tabs)
* Práticas de XAI (Inteligência Artificial Explicável)
* Responsividade e boas práticas de UI/UX
* Simulação ética de IA com foco em LGPD e redução de viés

📂 Estrutura do Projeto

DatariumMobile/
├── App.tsx
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── assets/ # Para assets específicos do código fonte, como imagens de ícones de componentes
│   └── utils/
├── assets/     # Para assets globais, como a logo principal ou fontes
├── package.json
└── tsconfig.json


👥 Integrantes

* Anna Yagyu 〡 RM 550360
* Breno Silva 〡 RM 99275
* Danilo Urze 〡 RM 99465
* Gabriel Pacheco 〡 RM 550191
* Pedro Ananias 〡 RM 550689

🧪 Como Executar o Projeto

Clone o repositório:

```bash
git clone <url-do-repositorio>
cd DatariumMobile
Instale as dependências:

Bash

npm install
Execute o projeto com Expo:

Bash

npx expo start
Escaneie o QR Code com o aplicativo Expo Go no seu celular.

📌 Observações

O projeto foi desenvolvido com foco acadêmico, simulando funcionalidades reais de um assessor de investimentos.
Nenhum dado financeiro real é utilizado. Todas as informações são fictícias e simuladas.