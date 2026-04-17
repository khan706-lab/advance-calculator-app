import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable animation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function CalculatorApp() {

  // State for input expression
  const [input, setInput] = useState('');

  // State for result output
  const [output, setOutput] = useState('0');

  // State for storing last 5 calculations
  const [records, setRecords] = useState([]);

  // Load history when app starts
  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle button clicks
  const onButtonClick = (val) => {
    LayoutAnimation.spring();

    if (val === 'CLR') {
      setInput('');
      setOutput('0');
      return;
    }

    if (val === 'DEL') {
      setInput(prev => prev.slice(0, -1));
      return;
    }

    if (val === '=') {
      evaluateExpression();
      return;
    }

    setInput(prev => prev + val);
  };

  // Function to calculate result
  const evaluateExpression = async () => {
    try {
      let exp = input
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/√/g, 'Math.sqrt')
        .replace(/π/g, 'Math.PI')
        .replace(/\^/g, '**') // FIX power operator
        .replace(/e/g, 'Math.E');

      const answer = eval(exp).toString();

      setOutput(answer);

      // Save last 5 calculations
      const updated = [{ exp: input, res: answer }, ...records].slice(0, 5);
      setRecords(updated);

      await AsyncStorage.setItem('calc_history', JSON.stringify(updated));

    } catch {
      setOutput('Invalid');
    }
  };

  // Load saved history
  const fetchHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('calc_history');
      if (data) setRecords(JSON.parse(data));
    } catch (e) {
      console.log('Error loading history');
    }
  };

  // Button UI component
  const Button = ({ title }) => (
    <Pressable style={styles.btn} onPress={() => onButtonClick(title)}>
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );

  return (
    <View style={styles.main}>

      {/* Display Section */}
      <View style={styles.screen}>
        <Text style={styles.inputText}>{input || '0'}</Text>
        <Text style={styles.outputText}>{output}</Text>
      </View>

      {/* Controls */}
      <View style={styles.row}>{['CLR','DEL','(',')'].map((b,i)=><Button key={i} title={b} />)}</View>

      {/* Scientific */}
      <View style={styles.row}>{['sin(','cos(','tan(','log('].map((b,i)=><Button key={i} title={b} />)}</View>
      <View style={styles.row}>{['√(','π','e','^'].map((b,i)=><Button key={i} title={b} />)}</View>

      {/* Numbers */}
      <View style={styles.row}>{['7','8','9','/'].map((b,i)=><Button key={i} title={b} />)}</View>
      <View style={styles.row}>{['4','5','6','*'].map((b,i)=><Button key={i} title={b} />)}</View>
      <View style={styles.row}>{['1','2','3','-'].map((b,i)=><Button key={i} title={b} />)}</View>
      <View style={styles.row}>{['0','.','=','+'].map((b,i)=><Button key={i} title={b} />)}</View>

      {/* History Section */}
      <View style={styles.historyBox}>
        <Text style={styles.historyHeading}>Recent Calculations</Text>
        {records.map((item, i) => (
          <Text key={i} style={styles.historyText}>
            {item.exp} = {item.res}
          </Text>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, padding: 15, backgroundColor: '#0f172a' },

  screen: { marginBottom: 20 },

  inputText: { color: '#94a3b8', fontSize: 20, textAlign: 'right' },
  outputText: { color: '#fff', fontSize: 34, textAlign: 'right' },

  row: { flexDirection: 'row', marginBottom: 8 },

  btn: {
    flex: 1,
    margin: 3,
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center'
  },

  btnText: { color: '#fff', fontSize: 16 },

  historyBox: { marginTop: 15 },

  historyHeading: { color: '#fff', fontSize: 15, marginBottom: 5 },
  historyText: { color: '#cbd5f5', fontSize: 12 }
});