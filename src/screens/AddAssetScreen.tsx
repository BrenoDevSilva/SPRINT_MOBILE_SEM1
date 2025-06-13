// src/screens/AddAssetScreen.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

import { RootStackParamList } from '../../App';
import { PortfolioContext, InvestmentAsset } from '../context/PortfolioContext'; // Importe InvestmentAsset

const { width, height } = Dimensions.get('window');

type AddAssetScreenNavigationProp = NavigationProp<RootStackParamList, 'AddAsset'>;

const ASSET_TYPES_SEGMENTS = ['Renda Fixa', 'Ações', 'Fundos', 'Outros'];
// Mapeia os nomes da UI para os valores da interface InvestmentAsset.type
const ASSET_TYPE_MAP = {
  'Renda Fixa': 'fixedIncome',
  'Ações': 'stocks',
  'Fundos': 'funds',
  'Outros': 'others',
} as const; // Adicionado 'as const' para inferir os tipos literais

// Mapeamento inverso para o SegmentedControl (usado para setar o tipo inicial do estado)
// Keyof typeof para inferir os tipos das chaves de ASSET_TYPE_MAP
type AssetTypeSegmentKey = keyof typeof ASSET_TYPE_MAP;


const AddAssetScreen: React.FC = () => {
  const navigation = useNavigation<AddAssetScreenNavigationProp>();
  const { addAsset, loadAssets } = useContext(PortfolioContext);

  const [assetName, setAssetName] = useState<string>('');
  // Use o tipo literal diretamente para o estado que corresponde aos segmentos
  const [assetTypeSegment, setAssetTypeSegment] = useState<AssetTypeSegmentKey>('Renda Fixa'); // <-- AQUI MUDOU

  const [assetValue, setAssetValue] = useState<string>('');
  const [assetPrice, setAssetPrice] = useState<string>('');

  const formatNumericInput = (text: string): string => {
    text = text.replace(/[^0-9.,]/g, '');
    return text.replace(',', '.');
  };

  const handleAddAsset = async () => {
    if (!assetName.trim() || !assetValue.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const parsedValue = parseFloat(formatNumericInput(assetValue));
    if (isNaN(parsedValue) || parsedValue <= 0) {
      Alert.alert('Erro', 'O valor/quantidade deve ser um número positivo válido.');
      return;
    }

    let parsedPrice: number | undefined;
    // Obtém o tipo de ativo mapeado para o formato da interface InvestmentAsset
    const currentAssetTypeMapped = ASSET_TYPE_MAP[assetTypeSegment]; // <-- AQUI MUDOU

    if (currentAssetTypeMapped === 'stocks') {
      if (!assetPrice.trim()) {
        Alert.alert('Erro', 'Para Ações, o preço por unidade é obrigatório.');
        return;
      }
      parsedPrice = parseFloat(formatNumericInput(assetPrice));
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        Alert.alert('Erro', 'O preço por unidade deve ser um número positivo válido.');
        return;
      }
    }

    const newAssetData: Omit<InvestmentAsset, 'id' | 'dailyChange' | 'dailyChangePercentage'> = {
      name: assetName.trim(),
      type: currentAssetTypeMapped, // <-- AQUI ESTÁ A CORREÇÃO
      value: parsedValue,
      pricePerUnit: parsedPrice,
    };

    console.log('Novo Ativo a ser adicionado:', newAssetData);

    try {
      await addAsset(newAssetData);
      await loadAssets(); // Recarregar os ativos na tela principal para mostrar o novo ativo

      Alert.alert(
        'Ativo Adicionado!',
        `Ativo: ${newAssetData.name}\nTipo: ${assetTypeSegment}\nValor: R$ ${newAssetData.value.toFixed(2)}${newAssetData.pricePerUnit ? `\nPreço/Unidade: R$ ${newAssetData.pricePerUnit.toFixed(2)}` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAssetName('');
              setAssetTypeSegment('Renda Fixa'); // Volta ao tipo padrão para o SegmentedControl
              setAssetValue('');
              setAssetPrice('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
      Alert.alert('Erro', 'Falha ao adicionar o ativo. Tente novamente.');
    }
  };

  return (
    <LinearGradient colors={['#002B5B', '#001D40']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={width * 0.07} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.title}>Comprar Ativo</Text>
              <View style={styles.headerRightSpacer} />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Nome do Ativo:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Tesouro Selic 2029 ou PETR4"
                placeholderTextColor="#A0A0A0"
                value={assetName}
                onChangeText={setAssetName}
                maxLength={50}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Tipo de Ativo:</Text>
              <View style={styles.segmentedControlContainer}>
                <SegmentedControl
                  values={ASSET_TYPES_SEGMENTS}
                  selectedIndex={ASSET_TYPES_SEGMENTS.indexOf(assetTypeSegment)} // Use indexOf
                  onChange={(event) => {
                    setAssetTypeSegment(ASSET_TYPES_SEGMENTS[event.nativeEvent.selectedSegmentIndex] as AssetTypeSegmentKey); // Atualiza o estado do segmento
                  }}
                  tintColor="#FFD700"
                  style={styles.segmentedControl}
                />
              </View>

              <Text style={styles.label}>
                {ASSET_TYPE_MAP[assetTypeSegment] === 'stocks' ? 'Quantidade de Cotas/Ações:' : 'Valor Total Investido (R$):'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={ASSET_TYPE_MAP[assetTypeSegment] === 'stocks' ? 'Ex: 100' : 'Ex: 5000,00'}
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={assetValue}
                onChangeText={setAssetValue}
              />

              {ASSET_TYPE_MAP[assetTypeSegment] === 'stocks' && (
                <>
                  <Text style={styles.label}>Preço por Unidade (R$):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 50,00"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    value={assetPrice}
                    onChangeText={setAssetPrice}
                  />
                </>
              )}

              <TouchableOpacity style={styles.addButton} onPress={handleAddAsset}>
                <Text style={styles.addButtonText}>Adicionar ao Portfólio</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: height * 0.03,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    height: Platform.OS === 'android' ? height * 0.12 : height * 0.1,
  },
  backButton: {
    paddingRight: width * 0.03,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRightSpacer: {
    width: width * 0.07,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: width * 0.05,
    marginHorizontal: width * 0.05,
    marginTop: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#002B5B',
    marginBottom: height * 0.01,
    marginTop: height * 0.02,
  },
  input: {
    height: height * 0.06,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    fontSize: width * 0.04,
    color: '#333333',
    backgroundColor: '#F9F9F9',
  },
  segmentedControlContainer: {
    marginBottom: height * 0.01,
  },
  segmentedControl: {
    height: height * 0.055,
    backgroundColor: '#002B5B', // Cor de fundo dos segmentos não selecionados
  },
  addButton: {
    backgroundColor: '#FFD700',
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  addButtonText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#002B5B', // Cor do texto do botão "Adicionar ao Portfólio"
  },
});

export default AddAssetScreen;