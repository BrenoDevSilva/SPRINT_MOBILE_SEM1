// src/screens/ExplanationScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, Platform, TouchableOpacity, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Habilita LayoutAnimation para Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width, height } = Dimensions.get('window');

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 60;

// --- TIPOS DE CONTEÚDO ---
type ExplanationContentItem = {
    id: string;
    type: 'paragraph' | 'section' | 'definition';
    text?: string;
    title?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    // Conteúdo para seções normais
    content?: { type: 'paragraph' | 'bullet' | 'heading-bullet'; text: string; subText?: string }[];
    // Novo tipo para sub-definições dentro de uma seção (específico para o glossário e FAQ)
    definitions?: { term: string; description: string }[];
    // Propriedades para itens do tipo 'definition' (que serão movidos para 'definitions')
    term?: string;
    description?: string;
};

// --- DADOS DO CONTEÚDO (ATUALIZADO E COMPLETO) ---
const explanationContent: ExplanationContentItem[] = [
    {
        id: 'intro',
        type: 'paragraph',
        text: 'Bem-vindo à seção de Explicações do Datarium! Aqui você encontrará informações valiosas para entender o mundo dos investimentos e tomar decisões mais informadas. Navegue pelos tópicos abaixo para aprimorar seus conhecimentos.',
    },
    {
        id: 'whatAreStocks',
        type: 'section',
        title: 'O que são Ações?',
        icon: 'bar-chart-outline',
        content: [
            {
                type: 'paragraph',
                text: 'Ações representam a menor fração do capital social de uma empresa. Ao comprar uma ação, você se torna sócio daquela empresa, com direitos e deveres proporcionais à sua participação. O objetivo é lucrar com a valorização da ação ou com a distribuição de dividendos. As ações podem ser negociadas na bolsa de valores, e seu preço varia conforme a oferta e demanda, bem como o desempenho da empresa e as expectativas do mercado.',
            },
            {
                type: 'heading-bullet',
                text: 'Tipos de Ações:',
                subText: 'Existem ações ordinárias (com direito a voto) e preferenciais (com preferência na distribuição de dividendos).',
            },
            {
                type: 'heading-bullet',
                text: 'Dividendos:',
                subText: 'Parte do lucro líquido de uma empresa distribuída aos acionistas, geralmente de forma periódica.',
            },
            {
                type: 'heading-bullet',
                text: 'Juros sobre Capital Próprio (JCP):',
                subText: 'Outra forma de remuneração aos acionistas, com benefício fiscal para a empresa.',
            },
            // --- SIMULAÇÃO ADICIONADA ---
            {
                type: 'heading-bullet',
                text: 'Como Lucrar com Ações (Exemplo):',
                subText: 'Se você compra 10 ações de uma empresa a R$20 cada (total R$200) e as vende quando o preço sobe para R$25 cada (total R$250), seu lucro bruto é de R$50. Isso desconsidera taxas e impostos, mas ilustra o conceito de valorização.',
            },
        ],
    },
    {
        id: 'investmentFunds',
        type: 'section',
        title: 'Fundos de Investimento',
        icon: 'wallet-outline',
        content: [
            {
                type: 'paragraph',
                text: 'Fundos de investimento são veículos financeiros coletivos, onde o dinheiro de diversos investidores é reunido para ser aplicado em uma carteira diversificada de ativos, gerida por um profissional (gestor do fundo). É uma forma de investir com diversificação e gestão especializada, mesmo com pouco capital.',
            },
            {
                type: 'heading-bullet',
                text: 'Fundos de Ações:',
                subText: 'Investem predominantemente em ações negociadas na bolsa de valores, buscando rentabilidade a longo prazo.',
            },
            {
                type: 'heading-bullet',
                text: 'Fundos Multimercado:',
                subText: 'Possuem liberdade para investir em diversas classes de ativos (renda fixa, ações, câmbio, derivativos), buscando retornos em diferentes cenários.',
            },
            {
                type: 'heading-bullet',
                text: 'Fundos de Renda Fixa:',
                subText: 'Aplicam em títulos de renda fixa, como Tesouro Direto, CDBs e debêntures, com foco em segurança e rentabilidade previsível.',
            },
            {
                type: 'heading-bullet',
                text: 'Fundos Imobiliários (FIIs):',
                subText: 'Investem em empreendimentos imobiliários (shoppings, escritórios, hospitais) e distribuem aluguéis aos cotistas.',
            },
        ],
    },
    {
        id: 'fixedIncome',
        type: 'section',
        title: 'O que é Renda Fixa?',
        icon: 'lock-closed-outline',
        content: [
            {
                type: 'paragraph',
                text: 'Renda Fixa é uma modalidade de investimento onde as regras de remuneração são definidas no momento da aplicação, oferecendo mais previsibilidade e segurança em comparação com a renda variável. É ideal para quem busca construir uma reserva de emergência ou tem objetivos de curto a médio prazo.',
            },
            {
                type: 'heading-bullet',
                text: 'Tesouro Direto:',
                subText: 'Títulos públicos emitidos pelo governo federal, considerados os investimentos mais seguros do Brasil. Existem diferentes tipos (Selic, IPCA+, Prefixado).',
            },
            {
                type: 'heading-bullet',
                text: 'CDBs (Certificados de Depósito Bancário):',
                subText: 'Títulos emitidos por bancos para captar recursos, geralmente remunerados por um percentual do CDI e com garantia do FGC.',
            },
            {
                type: 'heading-bullet',
                text: 'LCIs/LCAs (Letras de Crédito Imobiliário/Agronegócio):',
                subText: 'Títulos emitidos por bancos para financiar os setores imobiliário e do agronegócio, isentos de Imposto de Renda para pessoa física.',
            },
            {
                type: 'heading-bullet',
                text: 'Debêntures:',
                subText: 'Títulos de dívida emitidos por empresas para captar recursos, geralmente oferecendo maior rentabilidade, mas com risco maior que títulos bancários.',
            },
            // --- SIMULAÇÃO ADICIONADA ---
            {
                type: 'heading-bullet',
                text: 'O Poder dos Juros Compostos (Exemplo):',
                subText: 'Se você investe R$1.000 a uma taxa de 1% ao mês, após 12 meses, você terá aproximadamente R$1.126,83, com o juro rendendo sobre o juro. Pequenas quantias, com tempo, podem crescer muito!',
            },
        ],
    },
    {
        id: 'riskManagement',
        type: 'section',
        title: 'Gerenciamento de Risco',
        icon: 'shield-checkmark-outline',
        content: [
            {
                type: 'paragraph',
                text: 'Gerenciar o risco é fundamental para o sucesso de qualquer investimento. Envolve identificar, analisar e responder aos riscos que podem afetar seus objetivos financeiros. A diversificação é uma das estratégias mais importantes para mitigar perdas.',
            },
            {
                type: 'heading-bullet',
                text: 'Diversificação:',
                subText: 'A estratégia de não colocar todos os ovos na mesma cesta, distribuindo seus investimentos em diferentes classes de ativos, setores e regiões geográficas para reduzir o impacto de um mau desempenho em uma única área.',
            },
            {
                type: 'heading-bullet',
                text: 'Perfis de Risco:',
                subText: 'Classificação do investidor de acordo com sua tolerância a perdas e expectativas de retorno. Os principais são: Conservador, Moderado e Arrojado (ou Agressivo).',
            },
            {
                type: 'heading-bullet',
                text: 'Stop Loss:',
                subText: 'Uma ordem dada à corretora para vender um ativo automaticamente quando seu preço atinge um determinado limite, com o objetivo de limitar perdas em um investimento.',
            },
            {
                type: 'heading-bullet',
                text: 'Horizonte de Investimento:',
                subText: 'O período de tempo em que você planeja manter um investimento. Pode ser de curto, médio ou longo prazo e influencia o nível de risco que você pode assumir.',
            },
            // --- CUIDADO COM... ADICIONADO ---
            {
                type: 'heading-bullet',
                text: 'Cuidado com Promessas de Ganhos Fáceis:',
                subText: 'Se algo parece bom demais para ser verdade, provavelmente é! Desconfie de rendimentos muito acima do mercado e sem risco. Isso pode ser um golpe, como uma pirâmide financeira.',
            },
            {
                type: 'heading-bullet',
                text: 'Não Invista Tudo em Um Só Lugar:',
                subText: 'A falta de diversificação aumenta seu risco. Se uma única empresa ou setor vai mal, todo o seu capital é impactado. Diversifique seus investimentos para proteger seu patrimônio.',
            },
        ],
    },
    {
        id: 'financialPlanning',
        type: 'section',
        title: 'Planejamento Financeiro Básico',
        icon: 'calendar-outline',
        content: [
            {
                type: 'paragraph',
                text: 'O planejamento financeiro é a base para alcançar seus objetivos, sejam eles de curto, médio ou longo prazo. Envolve organizar suas finanças, criar um orçamento, controlar gastos e definir metas de investimento.',
            },
            {
                type: 'heading-bullet',
                text: 'Orçamento Pessoal:',
                subText: 'Ferramenta para registrar e acompanhar suas receitas e despesas, permitindo identificar onde seu dinheiro está sendo gasto e onde é possível economizar.',
            },
            {
                type: 'heading-bullet',
                text: 'Reserva de Emergência:',
                subText: 'Um valor poupado para cobrir despesas inesperadas (perda de emprego, problemas de saúde), geralmente equivalente a 6 a 12 meses de seus gastos essenciais, investido em algo com alta liquidez.',
            },
            {
                type: 'heading-bullet',
                text: 'Metas Financeiras:',
                subText: 'Definição clara e específica do que você quer alcançar (comprar um imóvel, aposentadoria, viagem), com prazos e valores definidos.',
            },
            // --- CUIDADO COM... ADICIONADO ---
            {
                type: 'heading-bullet',
                text: 'Não Deixe de Construir Sua Reserva de Emergência:',
                subText: 'Investir sem uma reserva de emergência é arriscado. Em caso de imprevistos, você pode ser forçado a resgatar investimentos antes da hora, perdendo dinheiro ou oportunidades.',
            },
            {
                type: 'heading-bullet',
                text: 'Fuja de Dívidas Caras:',
                subText: 'Antes de investir, priorize quitar dívidas com juros altos (cartão de crédito, cheque especial). A rentabilidade de muitos investimentos não compensa o custo dessas dívidas.',
            },
        ],
    },
    {
        id: 'glossary-section',
        type: 'section',
        title: 'Glossário Financeiro',
        icon: 'book-outline',
        content: [
            {
                type: 'paragraph',
                text: 'Entenda os termos financeiros mais importantes que você encontrará no mundo dos investimentos. Clique nos termos para expandir a descrição.',
            },
        ],
        definitions: [
            {
                term: 'Rentabilidade',
                description: 'Percentual de retorno sobre o investimento em um determinado período.',
            },
            {
                term: 'Liquidez',
                description: 'A facilidade e rapidez com que um ativo pode ser convertido em dinheiro, sem perdas significativas de valor.',
            },
            {
                term: 'Volatilidade',
                description: 'Medida da frequência e intensidade das variações de preço de um ativo ou mercado.',
            },
            {
                term: 'Dividendos',
                description: 'Parte do lucro de uma empresa distribuída aos acionistas.',
            },
            {
                term: 'CDI (Certificado de Depósito Interbancário)',
                description: 'Taxa de juros de empréstimos entre bancos, usada como principal referência de rentabilidade para muitos investimentos de renda fixa.',
            },
            {
                term: 'IPCA (Índice Nacional de Preços ao Consumidor Amplo)',
                description: 'O índice oficial de inflação do Brasil, medido pelo IBGE. Usado para corrigir valores e rentabilidades de alguns investimentos.',
            },
            {
                term: 'Taxa Selic',
                description: 'A taxa básica de juros da economia brasileira, definida pelo Banco Central. Influencia todas as taxas de juros do país e serve de referência para a rentabilidade de muitos investimentos.',
            },
            {
                term: 'FGC (Fundo Garantidor de Créditos)',
                description: 'Entidade que garante o ressarcimento de valores investidos em alguns produtos financeiros (como CDBs, LCIs, LCAs, Poupança) até um limite por CPF/CNPJ e por instituição financeira, em caso de falência do banco.',
            },
            {
                term: 'Bolsa de Valores',
                description: 'Ambiente onde são negociadas ações de empresas, títulos e outros ativos financeiros, facilitando a compra e venda entre investidores.',
            },
            {
                term: 'Ativo',
                description: 'Bem ou direito que gera valor econômico para uma pessoa ou empresa no futuro (ex: dinheiro, imóveis, ações).',
            },
            {
                term: 'Passivo',
                description: 'Obrigações e dívidas que uma pessoa ou empresa deve pagar (ex: empréstimos, contas a pagar).',
            },
            {
                term: 'Benchmark',
                description: 'Um índice ou taxa de referência usado para comparar o desempenho de um investimento ou carteira (ex: CDI, Ibovespa).',
            },
        ],
    },
    // --- NOVA SEÇÃO: PERGUNTAS FREQUENTES (FAQ) ---
    {
        id: 'faq-section',
        type: 'section',
        title: 'Perguntas Frequentes (FAQ)',
        icon: 'help-circle-outline', // Ícone de ajuda
        content: [
            {
                type: 'paragraph',
                text: 'Aqui você encontrará respostas rápidas para as dúvidas mais comuns sobre investimentos e finanças. Clique na pergunta para ver a resposta.',
            },
        ],
        // Usamos a estrutura 'definitions' para as perguntas e respostas
        definitions: [
            {
                term: 'Devo começar a investir com pouco dinheiro?',
                description: 'Sim! É crucial começar cedo, mesmo com pequenas quantias. O tempo é seu maior aliado nos investimentos devido ao poder dos juros compostos. Muitos investimentos permitem aportes a partir de R$30 ou R$100.',
            },
            {
                term: 'É seguro investir pela internet?',
                description: 'Sim, desde que você use corretoras e instituições financeiras regulamentadas pelo Banco Central (BACEN) e pela CVM (Comissão de Valores Mobiliários). Verifique sempre a reputação e regulamentação antes de investir.',
            },
            {
                term: 'Qual a diferença entre renda fixa e renda variável?',
                description: 'Renda Fixa tem regras de remuneração definidas no momento da aplicação, oferecendo mais previsibilidade (ex: Tesouro Direto, CDB). Renda Variável não tem retorno garantido e o preço oscila no mercado (ex: Ações, Fundos Imobiliários).',
            },
            {
                term: 'Preciso pagar imposto sobre meus investimentos?',
                description: 'Depende do tipo de investimento. Alguns são isentos para pessoa física (ex: LCIs/LCAs, Poupança). Outros têm incidência de Imposto de Renda (ex: Ações com vendas acima de R$20 mil/mês, Fundos de Investimento). Sempre consulte as regras específicas ou um contador.',
            },
            {
                term: 'O que é diversificação e por que é importante?',
                description: 'Diversificação é a estratégia de espalhar seus investimentos em diferentes tipos de ativos (ações, renda fixa, fundos) e setores. É importante porque reduz o risco de perder todo o seu dinheiro se um único investimento não performar bem.',
            },
            {
                term: 'Como escolher a melhor corretora de investimentos?',
                description: 'Considere fatores como taxas (corretagem zero, custódia), variedade de produtos, plataforma de fácil uso, suporte ao cliente e a reputação da corretora no mercado. Pesquise e compare antes de decidir.',
            },
        ],
    },
];

// --- COMPONENTE SectionAccordion (Inalterado) ---
interface SectionAccordionProps {
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    children: React.ReactNode;
}

const SectionAccordion: React.FC<SectionAccordionProps> = ({ title, icon, children }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleAccordion = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.accordionContainer}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.accordionHeader} activeOpacity={0.7}>
                <View style={styles.accordionTitleWrapper}>
                    {icon && <Ionicons name={icon} size={width * 0.06} color="#002B5B" style={styles.accordionIcon} />}
                    <Text style={styles.accordionTitle}>{title}</Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={width * 0.06}
                    color="#002B5B"
                />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.accordionContent}>
                    {children}
                </View>
            )}
        </View>
    );
};

// --- COMPONENTE PRINCIPAL: ExplanationScreen ---
export default function ExplanationScreen() {
    const navigation = useNavigation();

    return (
        <LinearGradient
            colors={['#002B5B', '#001D40']}
            style={styles.gradientBackground}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Explicações</Text>
                        <View style={styles.titleUnderline} />
                    </View>

                    {/* Conteúdo dinâmico */}
                    {explanationContent.map((item) => {
                        if (item.type === 'paragraph') {
                            return (
                                <Text key={item.id} style={styles.paragraph}>
                                    {item.text}
                                </Text>
                            );
                        } else if (item.type === 'section') {
                            return (
                                <SectionAccordion key={item.id} title={item.title || 'Seção'} icon={item.icon}>
                                    {/* Renderiza o conteúdo normal da seção, se existir */}
                                    {item.content?.map((subItem, subIndex) => {
                                        if (subItem.type === 'paragraph') {
                                            return <Text key={subIndex} style={styles.sectionParagraph}>{subItem.text}</Text>;
                                        } else if (subItem.type === 'bullet') {
                                            return <Text key={subIndex} style={styles.bulletPoint}>• {subItem.text}</Text>;
                                        } else if (subItem.type === 'heading-bullet') {
                                            return (
                                                <View key={subIndex} style={styles.headingBulletContainer}>
                                                    <Text style={styles.bulletPointMark}>• </Text>
                                                    <Text style={styles.headingBulletText}>
                                                        <Text style={styles.headingBulletBold}>{subItem.text} </Text>
                                                        {subItem.subText}
                                                    </Text>
                                                </View>
                                            );
                                        }
                                        return null;
                                    })}
                                    {/* NOVO: Renderiza as definições do glossário ou FAQ se a seção as tiver */}
                                    {(item.definitions && item.definitions.length > 0) && (
                                        <View style={styles.glossaryDefinitionsContainer}>
                                            {item.definitions.map((def, defIndex) => (
                                                // Cada definição/pergunta no FAQ também é um accordion
                                                <SectionAccordion key={defIndex} title={def.term}>
                                                    <View style={styles.definitionContent}>
                                                        <Text style={styles.definitionDescription}>{def.description}</Text>
                                                    </View>
                                                </SectionAccordion>
                                            ))}
                                        </View>
                                    )}
                                </SectionAccordion>
                            );
                        }
                        return null;
                    })}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: width * 0.05,
        paddingTop: Platform.OS === 'android' ? 50 : 70,
        paddingBottom: TAB_BAR_HEIGHT + (height * 0.02),
        alignItems: 'center',
    },
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: height * 0.03,
    },
    title: {
        fontSize: width * 0.09,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 3,
    },
    titleUnderline: {
        width: '80%',
        height: 3,
        backgroundColor: '#FFD700',
        borderRadius: 2,
    },
    paragraph: {
        fontSize: width * 0.045,
        color: '#E0E0E0',
        marginBottom: height * 0.03,
        textAlign: 'center',
        lineHeight: width * 0.06,
        paddingHorizontal: width * 0.02,
        fontWeight: '400',
    },
    // --- ESTILOS DO ACCORDION ---
    accordionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: height * 0.03,
        width: '100%',
        maxWidth: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        borderColor: '#E8EDF2',
        borderWidth: 0,
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: width * 0.05,
        backgroundColor: '#F7F9FC',
        borderBottomWidth: 0,
    },
    accordionTitleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    accordionIcon: {
        marginRight: width * 0.02,
    },
    accordionTitle: {
        fontSize: width * 0.06,
        fontWeight: '700',
        color: '#002B5B',
        flex: 1,
    },
    accordionContent: {
        padding: width * 0.05,
        backgroundColor: '#EBF4F8',
    },
    sectionParagraph: {
        fontSize: width * 0.04,
        color: '#34495E',
        marginBottom: height * 0.015,
        lineHeight: width * 0.06,
    },
    bulletPoint: {
        fontSize: width * 0.04,
        color: '#34495E',
        marginBottom: height * 0.008,
        marginLeft: width * 0.02,
        lineHeight: width * 0.06,
    },
    headingBulletContainer: {
        flexDirection: 'row',
        marginBottom: height * 0.008,
        marginLeft: width * 0.02,
    },
    bulletPointMark: {
        fontSize: width * 0.04,
        color: '#34495E',
        marginRight: width * 0.01,
        lineHeight: width * 0.06,
    },
    headingBulletText: {
        flex: 1,
        fontSize: width * 0.04,
        color: '#34495E',
        lineHeight: width * 0.06,
    },
    headingBulletBold: {
        fontWeight: '700',
        color: '#001D40',
        fontSize: width * 0.042,
    },
    // Estilo para o contêiner das definições dentro do glossário e FAQ
    glossaryDefinitionsContainer: {
        marginTop: height * 0.02,
        // Remover padding horizontal aqui se estiver duplicando o do accordionContent
        // paddingHorizontal: width * 0.02, // Removido ou ajustado para evitar padding duplo
    },
    // Estilo para o conteúdo da definição dentro do FAQ (a resposta)
    definitionContent: {
        paddingVertical: width * 0.02,
        paddingHorizontal: width * 0.02,
        backgroundColor: '#F0F8FF', // Um branco azulado para o fundo da resposta do FAQ
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#0056B3', // Uma cor de destaque para a barra lateral da resposta
        marginTop: height * 0.01,
        shadowColor: 'rgba(0, 43, 91, 0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    definitionTerm: { // Este estilo será aplicado como título do acordeão para o FAQ
        fontSize: width * 0.045,
        fontWeight: '700',
        color: '#003366',
        marginBottom: 5, // Será menos relevante pois o termo agora é o título do acordeão interno
    },
    definitionDescription: {
        fontSize: width * 0.038,
        color: '#5D6D7E',
        lineHeight: width * 0.055,
    },
});