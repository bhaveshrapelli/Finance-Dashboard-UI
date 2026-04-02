// Initial Mock Data
let transactions = [
  { id: 1, title: 'Grocery Supermarket', category: 'Food', amount: -120.50, type: 'expense', date: '2026-03-28' },
  { id: 2, title: 'TechCorp Salary', category: 'Salary', amount: 4500.00, type: 'income', date: '2026-03-25' },
  { id: 3, title: 'Electric Bill', category: 'Housing', amount: -85.00, type: 'expense', date: '2026-03-23' },
  { id: 4, title: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, type: 'expense', date: '2026-03-20' },
  { id: 5, title: 'Gas Station', category: 'Transportation', amount: -45.00, type: 'expense', date: '2026-03-18' },
  { id: 6, title: 'Freelance Project', category: 'Income', amount: 800.00, type: 'income', date: '2026-03-15' },
  { id: 7, title: 'Rent Payment', category: 'Housing', amount: -1200.00, type: 'expense', date: '2026-03-01' },
];

// App State
let appState = {
  role: 'viewer', // 'viewer' | 'admin'
  searchTerm: '',
  theme: localStorage.getItem('theme') || 'dark', // Default to beautiful dark mode
};

// DOM Elements
const els = {
  roleSelect: document.getElementById('roleSelect'),
  themeToggle: document.getElementById('themeToggle'),
  userRoleDisplay: document.getElementById('userRoleDisplay'),
  totalBalance: document.getElementById('totalBalance'),
  totalIncome: document.getElementById('totalIncome'),
  totalExpenses: document.getElementById('totalExpenses'),
  transactionTableBody: document.getElementById('transactionTableBody'),
  searchInput: document.getElementById('searchInput'),
  addTxnBtn: document.getElementById('addTxnBtn'),
  addModal: document.getElementById('addModal'),
  modalContent: document.getElementById('modalContent'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  addTxnForm: document.getElementById('addTxnForm'),
  emptyState: document.getElementById('emptyState'),
  dynamicInsight: document.getElementById('dynamicInsight'),
  topCategoryName: document.getElementById('topCategoryName'),
};

// Chart Instances
let trendChartInstance = null;
let categoryChartInstance = null;

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
};
const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Initialize App
function initApp() {
  applyTheme();
  initLucide();
  updateDashboard();
  renderTable();
  setupEventListeners();
  renderCharts();
  updateInsights();
}

// Ensure Lucide Icons are rendered
function initLucide() {
  lucide.createIcons();
}

// Update Theme
function applyTheme() {
  if (appState.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Event Listeners
function setupEventListeners() {
  // Theme Toggle
  els.themeToggle.addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', appState.theme);
    applyTheme();
    updateChartTheme();
  });

  // Role Toggle
  els.roleSelect.addEventListener('change', (e) => {
    appState.role = e.target.value;
    els.userRoleDisplay.textContent = appState.role === 'admin' ? 'Administrator' : 'Viewer';
    updateRoleUI();
  });

  // Search filter
  els.searchInput.addEventListener('input', (e) => {
    appState.searchTerm = e.target.value.toLowerCase();
    renderTable();
  });

  // Add Modal Toggles
  els.addTxnBtn.addEventListener('click', openModal);
  els.closeModalBtn.addEventListener('click', closeModal);
  els.cancelModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === els.addModal) closeModal();
  });

  // Form Submit
  els.addTxnForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amountVal = parseFloat(document.getElementById('txnAmount').value);
    const isExpense = document.getElementById('txnType').value === 'expense';
    
    const newTxn = {
      id: Date.now(),
      title: document.getElementById('txnTitle').value,
      amount: isExpense ? -Math.abs(amountVal) : Math.abs(amountVal),
      type: document.getElementById('txnType').value,
      category: document.getElementById('txnCategory').value,
      date: document.getElementById('txnDate').value
    };

    transactions.unshift(newTxn);
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    closeModal();
    updateDashboard();
    renderTable();
    updateCharts();
    updateInsights();
  });

  // chart timeframe toggle
  document.getElementById('trendTimeframe').addEventListener('change', updateCharts);
}

// Role based UI updates
function updateRoleUI() {
  const isAdmin = appState.role === 'admin';
  
  if (isAdmin) {
    els.addTxnBtn.classList.remove('hidden');
    els.addTxnBtn.classList.add('flex');
    document.querySelectorAll('.admin-col').forEach(el => el.classList.remove('hidden'));
  } else {
    els.addTxnBtn.classList.add('hidden');
    els.addTxnBtn.classList.remove('flex');
    document.querySelectorAll('.admin-col').forEach(el => el.classList.add('hidden'));
  }
}

// Modal Logic
function openModal() {
  els.addModal.classList.remove('opacity-0', 'pointer-events-none');
  els.modalContent.classList.remove('scale-95');
  els.modalContent.classList.add('scale-100');
  els.addTxnForm.reset();
  // Set default date to today
  document.getElementById('txnDate').value = new Date().toISOString().split('T')[0];
}

function closeModal() {
  els.addModal.classList.add('opacity-0', 'pointer-events-none');
  els.modalContent.classList.remove('scale-100');
  els.modalContent.classList.add('scale-95');
}

// Delete Transaction
window.deleteTransaction = function(id) {
  if (appState.role !== 'admin') return;
  if(confirm("Are you sure you want to delete this transaction?")) {
    transactions = transactions.filter(t => t.id !== id);
    updateDashboard();
    renderTable();
    updateCharts();
    updateInsights();
  }
};

// Rendering Logic
function updateDashboard() {
  let income = 0;
  let expenses = 0;

  transactions.forEach(t => {
    if (t.amount > 0) income += t.amount;
    else expenses += Math.abs(t.amount);
  });

  const balance = income - expenses;

  els.totalBalance.textContent = (balance < 0 ? '-' : '') + formatCurrency(balance);
  els.totalIncome.textContent = formatCurrency(income);
  els.totalExpenses.textContent = formatCurrency(expenses);
}

function renderTable() {
  const filtered = transactions.filter(t => 
    t.title.toLowerCase().includes(appState.searchTerm) || 
    t.category.toLowerCase().includes(appState.searchTerm)
  );

  if (filtered.length === 0) {
    els.transactionTableBody.innerHTML = '';
    els.emptyState.classList.remove('hidden');
    els.emptyState.classList.add('flex');
    return;
  }

  els.emptyState.classList.add('hidden');
  els.emptyState.classList.remove('flex');

  const isAdmin = appState.role === 'admin';

  els.transactionTableBody.innerHTML = filtered.map(t => {
    const isIncome = t.amount > 0;
    const amountClass = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white';
    
    // Icon mapping
    const iconMap = {
      'Food': 'utensils',
      'Housing': 'home',
      'Entertainment': 'monitor-play',
      'Transportation': 'car',
      'Salary': 'briefcase',
      'Income': 'dollar-sign',
      'Other': 'circle-ellipsis'
    };
    const iconName = iconMap[t.category] || 'circle-ellipsis';

    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-dark-panel/50 transition-colors group">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-dark-border rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <i data-lucide="${iconName}" class="w-5 h-5"></i>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900 dark:text-white">${t.title}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300">
            ${t.category}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          ${formatDate(t.date)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${amountClass}">
          ${isIncome ? '+' : '-'}${formatCurrency(t.amount)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium admin-col ${isAdmin ? '' : 'hidden'} opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="deleteTransaction(${t.id})" class="text-rose-500 hover:text-rose-700 transition-colors p-1 bg-rose-50 dark:bg-rose-500/10 rounded">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  // Re-init lucide icons for table
  initLucide();
}

// Chart functionality
Chart.defaults.color = () => document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b';
Chart.defaults.font.family = 'Inter, sans-serif';

function getChartColors() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    gridColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    textColor: isDark ? '#94a3b8' : '#64748b'
  };
}

function renderCharts() {
  const cColors = getChartColors();
  
  // Balance Trend Data
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  
  // Gradient for Trend line
  const gradient = trendCtx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(34, 197, 94, 0.5)'); // Brand color
  gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

  trendChartInstance = new Chart(trendCtx, {
    type: 'line',
    data: getTrendData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: cColors.gridColor,
          titleColor: cColors.textColor,
          bodyColor: cColors.textColor,
          borderColor: cColors.gridColor,
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: cColors.gridColor, drawBorder: false },
          ticks: { callback: (value) => '$' + value }
        },
        x: { 
          grid: { display: false, drawBorder: false }
        }
      },
      elements: {
        line: { tension: 0.4 },
        point: { radius: 0, hitRadius: 10, hoverRadius: 6 }
      }
    }
  });

  // Category Breakdown Data
  const catCtx = document.getElementById('categoryChart').getContext('2d');
  const catData = getCategoryData();
  
  categoryChartInstance = new Chart(catCtx, {
    type: 'doughnut',
    data: catData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, usePointStyle: true, padding: 20 } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ' ' + context.label + ': ' + formatCurrency(context.parsed);
            }
          }
        }
      }
    }
  });
}

function getTrendData() {
  // Aggregate transactions by month for simplicity
  const monthlyData = {};
  // Generate last 6 months labels
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const balances = [1200, 1800, 1600, 2100, 2400, 2700]; // Mock dynamic growth logic
  
  // Real data override for "March"
  let marActivity = 0;
  transactions.forEach(t => marActivity += t.amount);
  balances[5] = 2400 + marActivity; // Very simple dynamic touch

  return {
    labels: months,
    datasets: [{
      label: 'Balance',
      data: balances,
      borderColor: '#22c55e',
      borderWidth: 2,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true
    }]
  };
}

function getCategoryData() {
  const expenses = transactions.filter(t => t.amount < 0);
  const categories = {};
  
  expenses.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
  });
  
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  
  // Assign colors
  const colors = [
    '#3b82f6', // blue
    '#f43f5e', // rose
    '#8b5cf6', // violet
    '#eab308', // yellow
    '#14b8a6', // teal
    '#f97316'  // orange
  ];

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length),
      borderWidth: 0,
    }]
  };
}

function updateCharts() {
  const cColors = getChartColors();
  
  // Update Trend Chart
  trendChartInstance.data = getTrendData();
  if (trendChartInstance.options.scales.y.grid) trendChartInstance.options.scales.y.grid.color = cColors.gridColor;
  if (trendChartInstance.options.scales.x.grid) trendChartInstance.options.scales.x.grid.color = cColors.gridColor;
  trendChartInstance.update();

  // Update Category Chart
  const newCatData = getCategoryData();
  categoryChartInstance.data = newCatData;
  categoryChartInstance.update();
}

function updateChartTheme() {
  // Update global defaults and chart instances when theme switches
  Chart.defaults.color = function() {
    return document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b';
  };
  updateCharts();
}

function updateInsights() {
  const categories = getCategoryData();
  if (categories.labels.length === 0) {
    els.topCategoryName.textContent = '-';
    els.dynamicInsight.innerHTML = 'No expense data available to generate insights.';
    return;
  }
  
  const maxIdx = categories.datasets[0].data.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
  const topCat = categories.labels[maxIdx];
  const amount = categories.datasets[0].data[maxIdx];

  els.topCategoryName.textContent = topCat;
  els.dynamicInsight.innerHTML = `Your top spending category is currently <strong class="text-gray-900 dark:text-white">${topCat}</strong>, accounting for ${formatCurrency(amount)}. Consider setting a budget constraint here!`;
}

// Boot up
document.addEventListener('DOMContentLoaded', initApp);
