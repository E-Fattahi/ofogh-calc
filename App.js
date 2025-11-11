import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// نرخ‌ها - دقیقاً مشابه پایتون
const rates = {
  6: {'صنعت': 96250, 'خدمات': 80000, 'هنر': 62500},
  7: {'صنعت': 103468, 'خدمات': 86000, 'هنر': 67187},
  8: {'صنعت': 110687, 'خدمات': 92000, 'هنر': 71875},
  9: {'صنعت': 117906, 'خدمات': 98000, 'هنر': 76562},
  10: {'صنعت': 125125, 'خدمات': 104000, 'هنر': 81250},
};

const computeCost = (hours, decile, cluster) => {
  hours = parseInt(hours);
  decile = parseInt(decile);

  if (decile < 6) {
    return {
      result: 0,
      base_rate: 0,
      multiplier: 0,
      formula: 'دهک 1-5 -> خروجی 0'
    };
  }

  if (!rates[decile] || !rates[decile][cluster]) {
    throw new Error('دهک یا خوشه نامعتبر');
  }

  const base = rates[decile][cluster];
  let multiplier, result, formula;

  if (hours < 100) {
    multiplier = hours;
    result = base * multiplier;
    formula = `${hours} * ${base}`;
  } else if (hours <= 200) {
    multiplier = 100 + (hours - 100) * 0.5;
    result = base * multiplier;
    formula = `${base} * (100 + (hours-100)*0.5) = ${base} * ${multiplier}`;
  } else if (hours <= 300) {
    multiplier = 150 + (hours - 200) * 0.25;
    result = base * multiplier;
    formula = `${base} * (150 + (hours-200)*0.25) = ${base} * ${multiplier}`;
  } else {
    multiplier = 175 + (hours - 300) * 0.15;
    result = base * multiplier;
    formula = `${base} * (175 + (hours-300)*0.15) = ${base} * ${multiplier}`;
  }

  return {
    result: result,
    base_rate: base,
    multiplier: multiplier,
    formula: formula
  };
};

const fmt = (x) => {
  return parseInt(x).toLocaleString('fa-IR');
};

export default function App() {
  const [cluster, setCluster] = useState('صنعت');
  const [decile, setDecile] = useState('6');
  const [hours, setHours] = useState('0');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    try {
      const hoursNum = parseInt(hours);
      if (isNaN(hoursNum) || hoursNum < 0) {
        Alert.alert('خطا', 'لطفاً تعداد ساعت را به صورت یک عدد طبیعی وارد کنید.');
        return;
      }

      const output = computeCost(hoursNum, parseInt(decile), cluster);
      setResult(output);
    } catch (error) {
      Alert.alert('خطا', error.message);
    }
  };

  const copyToClipboard = async () => {
    if (!result) {
      Alert.alert('اطلاع', 'ابتدا محاسبه را انجام دهید.');
      return;
    }

    let text = '';
    if (result.result === 0) {
      text = 'خروجی: 0\nتوضیح: دهک‌های 1 تا 5 مقدار صفر دارند.';
    } else {
      text = `خوشه: ${cluster}\nدهک: ${decile}\nنتیجه نهایی: ${fmt(result.result)} ریال`;
    }

    // در وب نمی‌تونیم از Clipboard استفاده کنیم
    Alert.alert('نتیجه', text);
  };

  const clearForm = () => {
    setCluster('صنعت');
    setDecile('6');
    setHours('0');
    setResult(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>تعرفه خدمات آموزشی</Text>
        <Text style={styles.subtitle}>آموزشگاه فنی و حرفه ای افق</Text>
        <Text style={styles.phone}>09142201081</Text>
      </View>

      <View style={styles.form}>
        {/* انتخاب خوشه */}
        <Text style={styles.label}>خوشه:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cluster}
            onValueChange={setCluster}
            style={styles.picker}
          >
            <Picker.Item label="صنعت" value="صنعت" />
            <Picker.Item label="خدمات" value="خدمات" />
            <Picker.Item label="هنر" value="هنر" />
          </Picker>
        </View>

        {/* انتخاب دهک */}
        <Text style={styles.label}>دهک:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={decile}
            onValueChange={setDecile}
            style={styles.picker}
          >
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <Picker.Item key={num} label={num.toString()} value={num.toString()} />
            ))}
          </Picker>
        </View>

        {/* تعداد ساعت */}
        <Text style={styles.label}>تعداد ساعت:</Text>
        <TextInput
          style={styles.input}
          value={hours}
          onChangeText={setHours}
          keyboardType="numeric"
          placeholder="0"
        />

        {/* دکمه محاسبه */}
        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
          <Text style={styles.buttonText}>محاسبه</Text>
        </TouchableOpacity>

        {/* نمایش نتیجه */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>نتیجه محاسبه:</Text>
            {result.result === 0 ? (
              <>
                <Text style={styles.resultText}>خروجی: 0</Text>
                <Text style={styles.resultText}>توضیح: دهک‌های 1 تا 5 مقدار صفر دارند.</Text>
              </>
            ) : (
              <>
                <Text style={styles.resultText}>خوشه: {cluster}</Text>
                <Text style={styles.resultText}>دهک: {decile}</Text>
                <Text style={styles.resultText}>نتیجه نهایی: {fmt(result.result)} ریال</Text>
              </>
            )}
          </View>
        )}

        {/* دکمه‌های پایین */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
            <Text style={styles.buttonText}>نمایش نتیجه</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearForm}>
            <Text style={styles.buttonText}>پاک‌سازی</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: 'white',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    textAlign: 'right',
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'right',
    color: '#666',
  },
});