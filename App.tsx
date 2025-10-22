
import React, { useState, useCallback } from 'react';
import Button from './components/Button';
import { Operator } from './types';

const App: React.FC = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const formatOperand = (value: string): string => {
    if (value.length > 9 && value.includes('.')) {
        const parts = value.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        if (integerPart.length > 9) {
            return parseFloat(integerPart).toExponential(3);
        }
        return `${integerPart}.${decimalPart.slice(0, 9 - integerPart.length)}`;
    }
    if (value.length > 9) {
        return parseFloat(value).toExponential(3);
    }
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 8,
    }).format(parseFloat(value));
  };
  
  const calculate = (op1: number, op2: number, op: Operator): number => {
    switch (op) {
      case '+':
        return op1 + op2;
      case '−':
        return op1 - op2;
      case '×':
        return op1 * op2;
      case '÷':
        if (op2 === 0) return NaN; // Indicate error
        return op1 / op2;
    }
  };

  const handleDigitClick = useCallback((digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      if (displayValue.length >= 9) return;
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  }, [displayValue, waitingForSecondOperand]);

  const handleDecimalClick = useCallback(() => {
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  }, [displayValue, waitingForSecondOperand]);

  const handleOperatorClick = useCallback((nextOperator: Operator) => {
    const inputValue = parseFloat(displayValue);

    if (operator && firstOperand !== null && !waitingForSecondOperand) {
      const result = calculate(firstOperand, inputValue, operator);
      if (isNaN(result)) {
        setDisplayValue('Error');
      } else {
        setDisplayValue(String(result));
        setFirstOperand(result);
      }
    } else {
      setFirstOperand(inputValue);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  }, [displayValue, firstOperand, operator, waitingForSecondOperand]);
  
  const handleEqualsClick = useCallback(() => {
    if (operator === null || firstOperand === null || waitingForSecondOperand) {
      return;
    }
    const secondOperand = parseFloat(displayValue);
    const result = calculate(firstOperand, secondOperand, operator);
    
    if (isNaN(result)) {
      setDisplayValue('Error');
    } else {
      setDisplayValue(String(result));
    }

    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);

  }, [displayValue, firstOperand, operator, waitingForSecondOperand]);

  const handleClearClick = useCallback(() => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  }, []);

  const handlePlusMinusClick = useCallback(() => {
    if (displayValue === 'Error') return;
    setDisplayValue(String(parseFloat(displayValue) * -1));
  }, [displayValue]);

  const handlePercentClick = useCallback(() => {
    if (displayValue === 'Error') return;
    setDisplayValue(String(parseFloat(displayValue) / 100));
  }, [displayValue]);

  const handleButtonClick = (label: string) => {
    if (/\d/.test(label)) {
      handleDigitClick(label);
    } else if (label === '.') {
      handleDecimalClick();
    } else if (['+', '−', '×', '÷'].includes(label)) {
      handleOperatorClick(label as Operator);
    } else if (label === '=') {
      handleEqualsClick();
    } else if (label === 'AC') {
      handleClearClick();
    } else if (label === '+/−') {
      handlePlusMinusClick();
    } else if (label === '%') {
      handlePercentClick();
    }
  };

  const getButtonClassName = (label: string) => {
    if (['÷', '×', '−', '+', '='].includes(label)) {
      return 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600';
    }
    if (['AC', '+/−', '%'].includes(label)) {
      return 'bg-zinc-400 text-black hover:bg-zinc-300 active:bg-zinc-500';
    }
    if (label === '0') {
      return 'col-span-2 w-auto !justify-start pl-8 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800';
    }
    return 'bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800';
  };
  
  const buttons = [
    { label: displayValue === '0' ? 'AC' : 'C', ariaLabel: 'All Clear' },
    { label: '+/−', ariaLabel: 'Toggle Sign' },
    { label: '%', ariaLabel: 'Percent' },
    { label: '÷', ariaLabel: 'Divide' },
    { label: '7' }, { label: '8' }, { label: '9' },
    { label: '×', ariaLabel: 'Multiply' },
    { label: '4' }, { label: '5' }, { label: '6' },
    { label: '−', ariaLabel: 'Subtract' },
    { label: '1' }, { label: '2' }, { label: '3' },
    { label: '+', ariaLabel: 'Add' },
    { label: '0' }, { label: '.' },
    { label: '=', ariaLabel: 'Equals' },
  ];

  const buttonLabel = displayValue === '0' && firstOperand === null ? 'AC' : 'C';

  return (
    <div className="min-h-screen bg-zinc-900 flex justify-center items-center p-4">
      <div className="w-full max-w-xs mx-auto bg-black rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="h-24 flex items-end justify-end">
          <p 
            className="text-white font-light text-7xl tracking-tighter truncate"
            style={{ fontSize: displayValue.length > 6 ? '3.5rem' : '4.5rem' }}
          >
            {formatOperand(displayValue)}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3">
            <Button label={buttonLabel} onClick={handleClearClick} className={getButtonClassName('AC')} ariaLabel="Clear" />
            <Button label="+/−" onClick={handleButtonClick} className={getButtonClassName('+/−')} ariaLabel="Toggle Sign" />
            <Button label="%" onClick={handleButtonClick} className={getButtonClassName('%')} ariaLabel="Percent" />
            <Button label="÷" onClick={handleButtonClick} className={getButtonClassName('÷')} ariaLabel="Divide" />
            
            <Button label="7" onClick={handleButtonClick} className={getButtonClassName('7')} />
            <Button label="8" onClick={handleButtonClick} className={getButtonClassName('8')} />
            <Button label="9" onClick={handleButtonClick} className={getButtonClassName('9')} />
            <Button label="×" onClick={handleButtonClick} className={getButtonClassName('×')} ariaLabel="Multiply" />
            
            <Button label="4" onClick={handleButtonClick} className={getButtonClassName('4')} />
            <Button label="5" onClick={handleButtonClick} className={getButtonClassName('5')} />
            <Button label="6" onClick={handleButtonClick} className={getButtonClassName('6')} />
            <Button label="−" onClick={handleButtonClick} className={getButtonClassName('−')} ariaLabel="Subtract" />
            
            <Button label="1" onClick={handleButtonClick} className={getButtonClassName('1')} />
            <Button label="2" onClick={handleButtonClick} className={getButtonClassName('2')} />
            <Button label="3" onClick={handleButtonClick} className={getButtonClassName('3')} />
            <Button label="+" onClick={handleButtonClick} className={getButtonClassName('+')} ariaLabel="Add" />
            
            <Button label="0" onClick={handleButtonClick} className={getButtonClassName('0')} />
            <Button label="." onClick={handleButtonClick} className={getButtonClassName('.')} ariaLabel="Decimal" />
            <Button label="=" onClick={handleButtonClick} className={getButtonClassName('=')} ariaLabel="Equals" />
        </div>
      </div>
    </div>
  );
};

export default App;
