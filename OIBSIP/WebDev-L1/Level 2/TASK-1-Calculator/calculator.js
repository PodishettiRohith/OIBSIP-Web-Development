// Task Requirements Check:
// - CSS Grid button layout used[cite: 1]
// - Division-by-zero error handling implemented[cite: 1]
// - Operator chaining supported[cite: 1]
// - Event listeners used (no inline onclick attributes in HTML)[cite: 1]

let firstOperand = null;
let currentOperator = null;
let shouldResetDisplay = false;

const display = document.getElementById('display');
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const equalsButton = document.getElementById('equals');
const clearButton = document.getElementById('clear');
const backspaceButton = document.getElementById('backspace');

// Attach Event Listeners
numberButtons.forEach(button => {
  button.addEventListener('click', () => appendNumber(button.dataset.num));
});

operatorButtons.forEach(button => {
  button.addEventListener('click', () => setOperator(button.dataset.op));
});

equalsButton.addEventListener('click', evaluate);
clearButton.addEventListener('click', clear);
backspaceButton.addEventListener('click', backspace);

function appendNumber(number) {
  if (display.textContent === '0' || shouldResetDisplay || display.textContent === 'Error') {
    resetDisplay();
  }
  
  // Prevent multiple decimal points
  if (number === '.' && display.textContent.includes('.')) return;
  
  display.textContent += number;
}

function resetDisplay() {
  display.textContent = '';
  shouldResetDisplay = false;
}

function clear() {
  display.textContent = '0';
  firstOperand = null;
  currentOperator = null;
  shouldResetDisplay = false;
}

function backspace() {
  if (shouldResetDisplay || display.textContent === 'Error') return;
  display.textContent = display.textContent.slice(0, -1);
  if (display.textContent === '') {
    display.textContent = '0';
  }
}

function setOperator(operator) {
  if (currentOperator !== null && !shouldResetDisplay) {
    evaluate();
  }
  
  firstOperand = parseFloat(display.textContent);
  currentOperator = operator;
  shouldResetDisplay = true;
}

function evaluate() {
  if (currentOperator === null || shouldResetDisplay) return;

  const secondOperand = parseFloat(display.textContent);
  let result = 0;

  switch (currentOperator) {
    case '+':
      result = firstOperand + secondOperand;
      break;
    case '-':
      result = firstOperand - secondOperand;
      break;
    case '*':
      result = firstOperand * secondOperand;
      break;
    case '/':
      // Division by zero prevention
      if (secondOperand === 0) {
        display.textContent = 'Error';
        currentOperator = null;
        firstOperand = null;
        shouldResetDisplay = true;
        return;
      }
      result = firstOperand / secondOperand;
      break;
    default:
      return;
  }

  // Format decimal precision to prevent overflow issues
  result = Math.round(result * 100000) / 100000;
  display.textContent = result.toString();
  firstOperand = result;
  currentOperator = null;
  shouldResetDisplay = true;
}