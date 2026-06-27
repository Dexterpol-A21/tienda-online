// app.js - Tienda Online Frontend Logic

let rates    = { USD: 1, EUR: 1, MXN: 1 };
let currency = 'USD';
let products = [];
let cart     = JSON.parse(localStorage.getItem('cart') || '[]');
let token    = localStorage.getItem('token');
let user     = JSON.parse(localStorage.getItem('user') || 'null');
let cartOpen = false;

const SYMBOLS = { USD: '$', EUR: '€', MXN: '$' };
const LABELS  = { USD: 'USD', EUR: 'EUR', MXN: 'MXN' };

async function init() {
  updateAuthUI();
  await fetchRates();
  await fetchProducts();
  updateCartUI();
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  document.getElementById('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('regPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doRegister(); });
}

async function fetchRates() {
  try {
    const res  = await fetch('/api/rates');
    const data = await res.json();
    rates = { USD: 1, EUR: data.EUR, MXN: data.MXN };
    document.getElementById('ratesTicker').innerHTML =
      `<span>1 USD = <span class="text-white">${rates.EUR.toFixed(4)} EUR</span></span>` +
      `<span>1 USD = <span class="text-white">${rates.MXN.toFixed(2)} MXN</span></span>`;
  } catch {
    rates = { USD: 1, EUR: 0.92, MXN: 17.50 };
    document.getElementById('ratesTicker').innerHTML =
      `<span>1 USD ≈ <span class="text-white">0.92 EUR</span></span>` +
      `<span>1 USD ≈ <span class="text-white">17.50 MXN</span></span>`;
  }
}

function convertPrice(priceUSD) { return (parseFloat(priceUSD) * rates[currency]).toFixed(2); }
function formatPrice(priceUSD)  { return `${SYMBOLS[currency]}${convertPrice(priceUSD)} ${LABELS[currency]}`; }

async function fetchProducts() {
  try {
    const res = await fetch('/api/productos');
    if (!res.ok) throw new Error();
    products = await res.json();
    renderProducts();
  } catch {
    document.getElementById('productGrid').innerHTML =
      `<div class="col-span-3" style="text-align:center;padding:4rem 0;color:#737373">
        <p style="font-weight:600">No se pudieron cargar los productos</p>
        <p style="font-size:0.8125rem">Verifica que el servidor esté corriendo</p>
      </div>`;
  }
}

const svgs = {
  laptop:     '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>',
  headphones: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
  camera:     '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',
  backpack:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"></path></svg>',
  monitor:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
  mouse:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="7" ry="7"></rect><line x1="12" y1="2" x2="12" y2="10"></line></svg>',
  keyboard:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"></path></svg>',
  watch:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"></circle><polyline points="12 9 12 12 13.5 13.5"></polyline><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"></path></svg>',
  tablet:     '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>'
};

function getIcon(name, size='48', cls='text-neutral-500') {
  const svg = svgs[name] || svgs.laptop;
  return svg.replace('<svg', `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="${cls}"`);
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!products.length) { grid.innerHTML = '<p class="col-span-full text-center py-20 text-neutral-500">No hay productos</p>'; return; }
  grid.innerHTML = products.map(p => `
    <div class="group relative flex flex-col gap-3 p-4 bg-[#0A0A0A] border border-[#222] hover:border-[#444] rounded-2xl transition-all duration-300">
      <div class="h-24 w-full flex items-center justify-center text-neutral-600 group-hover:text-white transition-colors duration-300">${getIcon(p.imagen_url, '32', 'currentColor')}</div>
      <div class="flex flex-col gap-1 items-center text-center mt-2">
        <p class="text-[0.625rem] font-bold tracking-widest uppercase text-neutral-500">${escapeHtml(p.categoria || 'General')}</p>
        <h4 class="text-sm font-semibold text-white tracking-tight leading-tight">${escapeHtml(p.nombre)}</h4>
        <p class="text-sm font-bold text-neutral-400 mt-1">${formatPrice(p.precio_usd)}</p>
      </div>
      <button onclick="addToCart(${p.id})" class="mt-2 w-full py-2 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold transition-all active:scale-[0.98]">Añadir al carrito</button>
    </div>`).join('');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty++; else cart.push({ ...product, qty: 1 });
  saveCart(); updateCartUI(); showToast(`${product.nombre} agregado al carrito`);
}
function removeFromCart(productId) { cart = cart.filter(i => i.id !== productId); saveCart(); updateCartUI(); }
function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(productId); return; }
  saveCart(); updateCartUI();
}
function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }
function clearCart() { cart = []; saveCart(); updateCartUI(); }

function updateCartUI() {
  ['USD','EUR','MXN'].forEach(k => {
    const btn = document.getElementById(`cartCur${k}`);
    if (btn) btn.classList.toggle('active', k === currency);
  });
  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) clearBtn.classList.toggle('hidden', cart.length === 0);
  const count = cart.reduce((s,i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const totalUSD = cart.reduce((s,i) => s + parseFloat(i.precio_usd) * i.qty, 0);
  document.getElementById('cartTotal').textContent = formatPrice(totalUSD);
  const itemsEl = document.getElementById('cartItems');
  if (!cart.length) { itemsEl.innerHTML = `<div class="text-center py-20 text-neutral-500"><p class="text-sm font-semibold tracking-widest uppercase">Carrito vacío</p></div>`; return; }
  itemsEl.innerHTML = cart.map(item => `
    <div class="flex gap-4 p-4 border border-[#222] rounded-xl bg-[#111] items-center">
      <div class="w-14 h-14 bg-[#1a1a1a] rounded-lg shrink-0 flex items-center justify-center border border-[#222]">${getIcon(item.imagen_url,'24','text-neutral-400')}</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-white truncate">${escapeHtml(item.nombre)}</p>
        <p class="text-neutral-400 font-medium text-xs mt-0.5">${formatPrice(item.precio_usd)}</p>
        <div class="flex items-center gap-3 mt-3">
          <div class="flex items-center bg-[#0A0A0A] border border-[#222] rounded-lg overflow-hidden">
            <button onclick="changeQty(${item.id},-1)" class="w-7 h-7 text-neutral-400 hover:text-white transition-colors flex items-center justify-center">−</button>
            <span class="text-xs font-bold text-white w-6 text-center">${item.qty}</span>
            <button onclick="changeQty(${item.id},1)" class="w-7 h-7 text-neutral-400 hover:text-white transition-colors flex items-center justify-center">+</button>
          </div>
          <button onclick="removeFromCart(${item.id})" class="text-[0.6875rem] font-bold tracking-wider uppercase text-neutral-500 hover:text-red-400 transition-colors ml-auto">Quitar</button>
        </div>
      </div>
    </div>`).join('');
}

function setCurrency(c) {
  currency = c;
  ['USD','EUR','MXN'].forEach(k => {
    const hBtn = document.getElementById(`headerCur${k}`);
    if (hBtn) hBtn.classList.toggle('active', k === c);
    const cBtn = document.getElementById(`cartCur${k}`);
    if (cBtn) cBtn.classList.toggle('active', k === c);
  });
  renderProducts(); updateCartUI();
}

function toggleCart() {
  cartOpen = !cartOpen;
  document.getElementById('cartSidebar').classList.toggle('translate-x-full', !cartOpen);
  document.getElementById('cartOverlay').classList.toggle('hidden', !cartOpen);
}

function checkout() {
  if (!user) { if (cartOpen) toggleCart(); openModal('login'); showToast('Inicia sesión para finalizar la compra'); return; }
  if (!cart.length) return;
  showToast('Compra realizada con éxito');
  cart = []; saveCart(); updateCartUI();
  if (cartOpen) toggleCart();
}

function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  if (user) {
    const first = escapeHtml(user.nombre.split(' ')[0]);
    const initial = escapeHtml(user.nombre[0].toUpperCase());
    authBtn.innerHTML = `<div class="header-user"><div class="user-avatar">${initial}</div><span class="user-name">${first}</span><button onclick="doLogout()" class="btn-ghost">Salir</button></div>`;
  } else {
    authBtn.innerHTML = `<button onclick="openModal('login')" class="btn-outline-white">Entrar</button>`;
  }
}

function setFieldError(inputId, spanId, msg) {
  const input = document.getElementById(inputId);
  const span  = document.getElementById(spanId);
  if (msg) { input.classList.add('input-error'); span.textContent = msg; span.classList.remove('hidden'); }
  else     { input.classList.remove('input-error'); span.classList.add('hidden'); }
}
function clearFieldErrors(...pairs) { pairs.forEach(([i,s]) => setFieldError(i,s,'')); }

async function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl  = document.getElementById('loginError');
  errorEl.classList.add('hidden');
  clearFieldErrors(['loginEmail','loginEmailErr'],['loginPassword','loginPasswordErr']);
  let valid = true;
  if (!email) { setFieldError('loginEmail','loginEmailErr','Ingresa tu correo'); valid=false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('loginEmail','loginEmailErr','Correo no válido'); valid=false; }
  if (!password) { setFieldError('loginPassword','loginPasswordErr','Ingresa tu contraseña'); valid=false; }
  if (!valid) return;
  try {
    const res  = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setSession(data.token, data.user);
    showModalSuccess(`Bienvenido, ${user.nombre.split(' ')[0]}`);
  } catch (err) { showError(errorEl, err.message || 'Error al iniciar sesión'); }
}

async function doRegister() {
  const nombre   = document.getElementById('regNombre').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const errorEl  = document.getElementById('registerError');
  errorEl.classList.add('hidden');
  clearFieldErrors(['regNombre','regNombreErr'],['regEmail','regEmailErr'],['regPassword','regPasswordErr']);
  let valid = true;
  if (!nombre) { setFieldError('regNombre','regNombreErr','Ingresa tu nombre'); valid=false; }
  if (!email) { setFieldError('regEmail','regEmailErr','Ingresa tu correo'); valid=false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('regEmail','regEmailErr','Correo no válido'); valid=false; }
  if (!password) { setFieldError('regPassword','regPasswordErr','Ingresa una contraseña'); valid=false; }
  else if (password.length < 6) { setFieldError('regPassword','regPasswordErr','Mínimo 6 caracteres'); valid=false; }
  if (!valid) return;
  try {
    const res  = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({nombre,email,password}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setSession(data.token, data.user);
    showModalSuccess(`Cuenta creada. Bienvenido, ${user.nombre.split(' ')[0]}`);
  } catch (err) { showError(errorEl, err.message || 'Error al registrarse'); }
}

function doLogout() { token=null; user=null; localStorage.removeItem('token'); localStorage.removeItem('user'); updateAuthUI(); showToast('Sesión cerrada'); }
function setSession(t,u) { token=t; user=u; localStorage.setItem('token',t); localStorage.setItem('user',JSON.stringify(u)); updateAuthUI(); }

function openModal(tab='login') { document.getElementById('modal').classList.remove('hidden'); switchTab(tab); }
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modalSuccess').classList.add('hidden');
  document.getElementById('loginError').classList.add('hidden');
  document.getElementById('registerError').classList.add('hidden');
}
function showModalSuccess(msg) {
  document.getElementById('modalSuccessMsg').textContent = msg;
  document.getElementById('modalSuccess').classList.remove('hidden');
  setTimeout(closeModal, 1600);
}
function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('formLogin').classList.toggle('hidden', !isLogin);
  document.getElementById('formRegister').classList.toggle('hidden', isLogin);
  document.getElementById('tabLogin').className    = `modal-seg-btn${isLogin  ? ' active' : ''}`;
  document.getElementById('tabRegister').className = `modal-seg-btn${!isLogin ? ' active' : ''}`;
}
document.getElementById('modal').addEventListener('click', (e) => { if (e.target === document.getElementById('modal')) closeModal(); });

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.style.opacity = '1'; toast.style.transform = 'translateY(0)';
  toastTimer = setTimeout(() => { toast.style.opacity='0'; toast.style.transform='translateY(1rem)'; }, 3000);
}

function showError(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

init();
