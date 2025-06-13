import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Dimensions, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Se você for reintroduzir o BlurView no futuro, lembre-se de importar:
// import { BlurView } from 'expo-blur';

// Importar os detalhes das recomendações do arquivo JSON
import allRecommendationDetails from '../data/recommendationDetails.json';

// Define o tipo para as respostas do perfil
interface InvestorProfile {
  experience?: string;
  objective?: string;
  risk?: string;
  investmentHorizon?: string;
  availableAmount?: string;
  esgInterest?: string;
  monthlyIncome?: string;
  financialSituation?: string;
}

interface RecommendationDetail {
  title: string;
  description: string;
  icon: string;
  riskLevel: 'Baixo' | 'Moderado' | 'Alto';
  returnPotential: 'Baixo' | 'Médio' | 'Alto';
  simulatedHistory: { year: string; value: number }[];
}

const INVESTOR_PROFILE_KEY = '@datarium_investor_profile';

const { width } = Dimensions.get('window');

// Altura da barra de navegação inferior (consistente com HomeTabs.tsx)
// No HomeTabs.tsx, a altura é 90 para iOS (incluindo safe area) e 60 para Android.
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 60;

export default function DashboardScreen() {
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationDetail[]>([]);
  const isFocused = useIsFocused();

  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadAndRecommend = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(INVESTOR_PROFILE_KEY);
        if (storedProfile) {
          const profile: InvestorProfile = JSON.parse(storedProfile);
          setInvestorProfile(profile);
          generateRecommendations(profile);
          console.log('Perfil do investidor CARREGADO no Dashboard:', profile);
        } else {
          console.log('Perfil do investidor não encontrado. Exibindo recomendações gerais ou pedindo para preencher.');
          setInvestorProfile(null);
          setRecommendations([{
              title: 'Perfil não preenchido',
              description: 'Por favor, preencha seu perfil de investidor na aba "Perfil" para receber recomendações personalizadas.',
              icon: 'information-circle-outline',
              riskLevel: 'Baixo',
              returnPotential: 'Baixo',
              simulatedHistory: []
          }]);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil para Dashboard:', error);
        setRecommendations([{
            title: 'Erro ao carregar',
            description: 'Ocorreu um erro ao carregar seu perfil. Tente novamente mais tarde.',
            icon: 'warning-outline',
            riskLevel: 'Baixo',
            returnPotential: 'Baixo',
            simulatedHistory: []
        }]);
      }
    };

    if (isFocused) {
      loadAndRecommend();
    }
  }, [isFocused]);

  const generateRecommendations = (profile: InvestorProfile) => {
    const recommendedKeys: string[] = [];
    const finalRecommendations: RecommendationDetail[] = [];

    if (profile.risk === 'avoid') {
      recommendedKeys.push('Tesouro Direto Selic');
      recommendedKeys.push('CDBs de liquidez diária');
      if (profile.availableAmount === 'upTo1000') {
          recommendedKeys.push('Fundos de Renda Fixa de baixo risco');
      }
    } else if (profile.risk === 'some') {
      recommendedKeys.push('CDBs de médio e longo prazo (prefixados, IPCA+)');
      recommendedKeys.push('Fundos Multimercado Moderados');
      recommendedKeys.push('Fundos de Investimento Imobiliário (FIIs)');
    } else if (profile.risk === 'high') {
      recommendedKeys.push('Ações de grandes empresas (Blue Chips)');
      recommendedKeys.push('Fundos de Ações');
      recommendedKeys.push('Criptoativos (com cautela e estudo)');
    }

    if (profile.objective === 'growth') {
      recommendedKeys.push('Foco em ações com potencial de valorização');
    } else if (profile.objective === 'income') {
      recommendedKeys.push('Foco em fundos imobiliários e ações pagadoras de dividendos');
    }

    if (profile.esgInterest === 'yes') {
      recommendedKeys.push('Considere Fundos ESG e empresas sustentáveis');
    }

    Array.from(new Set(recommendedKeys)).forEach(key => {
      if (allRecommendationDetails[key as keyof typeof allRecommendationDetails]) {
        finalRecommendations.push(allRecommendationDetails[key as keyof typeof allRecommendationDetails] as RecommendationDetail);
      }
    });

    setRecommendations(finalRecommendations);
  };

  const openDetailsModal = (rec: RecommendationDetail) => {
    setSelectedRecommendation(rec);
    setModalVisible(true);
  };

  const closeDetailsModal = () => {
    setModalVisible(false);
    setSelectedRecommendation(null);
  };

  return (
    <LinearGradient
      colors={['#002B5B', '#001D40']}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Bem-vindo ao Dashboard!</Text>
        <View style={styles.headerUnderline} />

        <View style={styles.profileSummaryCard}>
          <Text style={styles.profileSummaryTitle}>Seu Perfil de Investidor:</Text>
          <Text style={styles.profileSummaryText}>
            Experiência: <Text style={styles.profileSummaryValue}>
              {investorProfile?.experience === 'none' ? 'Nenhuma' :
               investorProfile?.experience === 'some' ? 'Alguma' :
               investorProfile?.experience === 'a_lot' ? 'Muita' : 'Não definido'}
            </Text>
          </Text>
          <Text style={styles.profileSummaryText}>
            Objetivo: <Text style={styles.profileSummaryValue}>
              {investorProfile?.objective === 'preserve' ? 'Preservar Capital' :
               investorProfile?.objective === 'income' ? 'Obter Renda' :
               investorProfile?.objective === 'growth' ? 'Crescimento Agressivo' : 'Não definido'}
            </Text>
          </Text>
          <Text style={styles.profileSummaryText}>
            Risco: <Text style={styles.profileSummaryValue}>
              {investorProfile?.risk === 'avoid' ? 'Conservador' :
               investorProfile?.risk === 'some' ? 'Moderado' :
               investorProfile?.risk === 'high' ? 'Agressivo' : 'Não definido'}
            </Text>
          </Text>
          <Text style={styles.profileSummaryText}>
            Horizonte: <Text style={styles.profileSummaryValue}>
              {investorProfile?.investmentHorizon === 'shortTerm' ? 'Curto Prazo' :
               investorProfile?.investmentHorizon === 'mediumTerm' ? 'Médio Prazo' :
               investorProfile?.investmentHorizon === 'longTerm' ? 'Longo Prazo' : 'Não definido'}
            </Text>
          </Text>
        </View>

        <Text style={styles.subHeader}>Suas Recomendações Personalizadas:</Text>
        <View style={styles.subHeaderUnderline} />

        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <View key={rec.title} style={styles.recommendationCard}>
              <View style={styles.cardHeader}>
                <Ionicons name={rec.icon as any} size={30} color="#003366" style={styles.cardIcon} />
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
              </View>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
              <TouchableOpacity style={styles.detailsButton} onPress={() => openDetailsModal(rec)}>
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.detailsButtonText}>Saiba Mais</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noRecommendationText}>Carregando recomendações ou nenhum perfil encontrado.</Text>
        )}

        {/* Modal de Detalhes da Recomendação (se você não reintroduziu o BlurView, ele ainda estará com o rgba(0,0,0,0.7) no centeredView) */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeDetailsModal}
        >
          {/* Se você voltou o código para antes do blur, o centeredView pode ter background: 'rgba(0,0,0,0.7)' */}
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedRecommendation?.title}</Text>
              <Text style={styles.modalDescription}>{selectedRecommendation?.description}</Text>

              <Text style={styles.chartTitle}>Desempenho Simulado (Últimos 5 Anos)</Text>
              <View style={styles.chartContainer}>
                {selectedRecommendation?.simulatedHistory && selectedRecommendation.simulatedHistory.length > 1 && (
                  <View style={styles.chartLines}>
                    {selectedRecommendation.simulatedHistory.map((data, index) => {
                      if (index === 0) return null;
                      const prevValue = selectedRecommendation.simulatedHistory[index - 1].value;
                      const currentValue = data.value;
                      const percentageChange = ((currentValue - prevValue) / prevValue) * 100;
                      const barHeight = Math.max(1, (currentValue / 25000) * 100);
                      const barWidth = 100 / (selectedRecommendation.simulatedHistory.length - 1);

                      return (
                        <View key={data.year} style={[styles.chartBarWrapper, { width: `${barWidth}%` }]}>
                          <View
                            style={[
                              styles.chartBar,
                              { height: `${barHeight}%`, backgroundColor: percentageChange >= 0 ? '#28A745' : '#E74C3C' }
                            ]}
                          />
                          <Text style={styles.chartYear}>{data.year}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
                 {selectedRecommendation?.simulatedHistory && selectedRecommendation.simulatedHistory.length > 1 && (
                    <View style={styles.chartLabels}>
                        <Text style={styles.chartLabelText}>Início</Text>
                        <Text style={styles.chartLabelText}>Atual</Text>
                    </View>
                )}
              </View>

              <Text style={styles.meterTitle}>Risco: <Text style={styles.meterValue}>{selectedRecommendation?.riskLevel}</Text></Text>
              <View style={styles.meterContainer}>
                <View style={[styles.meterSegment, selectedRecommendation?.riskLevel === 'Baixo' && styles.meterSegmentActiveLow]} />
                <View style={[styles.meterSegment, selectedRecommendation?.riskLevel === 'Moderado' && styles.meterSegmentActiveMedium]} />
                <View style={[styles.meterSegment, selectedRecommendation?.riskLevel === 'Alto' && styles.meterSegmentActiveHigh]} />
              </View>

              <Text style={styles.meterTitle}>Potencial de Retorno: <Text style={styles.meterValue}>{selectedRecommendation?.returnPotential}</Text></Text>
              <View style={styles.meterContainer}>
                <View style={[styles.meterSegment, selectedRecommendation?.returnPotential === 'Baixo' && styles.meterSegmentActiveLow]} />
                <View style={[styles.meterSegment, selectedRecommendation?.returnPotential === 'Médio' && styles.meterSegmentActiveMedium]} />
                <View style={[styles.meterSegment, selectedRecommendation?.returnPotential === 'Alto' && styles.meterSegmentActiveHigh]} />
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeDetailsModal}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  contentContainer: {
    padding: width * 0.05,
    paddingTop: Platform.OS === 'android' ? 50 : 70,
    paddingBottom: TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? 20 : 0) + (width * 0.05), // Adiciona padding extra para a barra de navegação
    alignItems: 'center',
  },
  header: {
    fontSize: width * 0.09,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  headerUnderline: {
    width: '80%',
    height: 3,
    backgroundColor: '#FFD700',
    marginBottom: 30,
    borderRadius: 2,
  },
  subHeader: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 40,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  subHeaderUnderline: {
    width: '60%',
    height: 2,
    backgroundColor: '#FFD700',
    marginBottom: 25,
    borderRadius: 1,
  },
  profileSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: width * 0.05,
    marginBottom: 30,
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderColor: '#E8EDF2',
    borderWidth: 1,
  },
  profileSummaryTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileSummaryText: {
    fontSize: width * 0.038,
    color: '#5D6D7E',
    lineHeight: width * 0.06,
    textAlign: 'left',
  },
  profileSummaryValue: {
    fontWeight: 'bold',
    color: '#003366',
  },
  noProfileText: {
    fontSize: width * 0.04,
    color: '#E74C3C',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: width * 0.05,
    marginVertical: 12,
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderColor: '#E8EDF2',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    marginRight: 10,
    color: '#003366',
  },
  recommendationTitle: {
    fontSize: width * 0.048,
    fontWeight: 'bold',
    color: '#003366',
    flexShrink: 1,
  },
  recommendationDescription: {
    fontSize: width * 0.036,
    color: '#5D6D7E',
    marginBottom: 15,
    lineHeight: width * 0.055,
  },
  detailsButton: {
    backgroundColor: '#0056B3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontWeight: '600',
    marginLeft: 5,
  },
  noRecommendationText: {
    fontSize: width * 0.04,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: width * 0.08,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: width * 0.038,
    color: '#5D6D7E',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: width * 0.058,
  },
  closeButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    width: '80%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  chartTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 15,
    marginBottom: 10,
  },
  chartContainer: {
    width: '100%',
    height: 120,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingHorizontal: 10,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#DCE4EB',
    borderRadius: 8,
    backgroundColor: '#F7F9FC',
    position: 'relative',
  },
  chartLines: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: '80%',
  },
  chartBarWrapper: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  chartBar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 2,
  },
  chartYear: {
    fontSize: width * 0.028,
    color: '#7F8C8D',
    marginTop: 5,
    position: 'absolute',
    bottom: -15,
  },
  chartLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  chartLabelText: {
    fontSize: width * 0.028,
    color: '#7F8C8D',
  },
  meterTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  meterValue: {
    fontWeight: 'bold',
    color: '#003366',
  },
  meterContainer: {
    flexDirection: 'row',
    width: '80%',
    height: 15,
    backgroundColor: '#E8EDF2',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  meterSegment: {
    flex: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  meterSegmentActiveLow: {
    backgroundColor: '#2ECC71',
  },
  meterSegmentActiveMedium: {
    backgroundColor: '#F1C40F',
  },
  meterSegmentActiveHigh: {
    backgroundColor: '#E74C3C',
  },
});