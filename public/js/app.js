/**
 * App frontend: redirección según auth, usuario actual, notificaciones.
 */

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function setUserAndToken(user, token) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!requireAuth()) return false;
  const user = getCurrentUser();
  if (user && user.rol !== 'admin') {
    if (typeof Swal !== 'undefined') {
      Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'Solo administradores.' });
    }
    setTimeout(() => (window.location.href = '/index.html'), 1500);
    return false;
  }
  return true;
}

function showLoading(message = 'Cargando...') {
  if (typeof Swal !== 'undefined') {
    Swal.fire({ title: message, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  }
}

function closeLoading() {
  if (typeof Swal !== 'undefined') Swal.close();
}

function showSuccess(title, text) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({ icon: 'success', title: title || '¡Listo!', text: text || '' });
  } else alert(title + (text ? '\n' + text : ''));
}

function showError(title, text) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({ icon: 'error', title: title || 'Error', text: text || '' });
  } else alert(title + (text ? '\n' + text : ''));
}

// Carrito de compras
const cart = {
  items: [],
  
  add: async function(productId, quantity = 1) {
    if (!requireAuth()) return;
    
    try {
      const data = await cart.getCart();
      loading.classList.add('hidden');
      if (!data.items || !data.items.length) {
        cartItems.innerHTML = '<p class="text-white/70 text-center py-8">Tu carrito está vacío.</p>';
        cartTotal.textContent = '$0.00';
        return;
      }
      content.classList.remove('hidden');
      empty.classList.add('hidden');
      
      cartItems.innerHTML = data.items.map(item => `
        <div class="glass-card p-4 flex flex-wrap items-center justify-between gap-4 animate__animated animate__fadeInUp" style="animation-delay: ${i * 0.03}s">
          <div class="flex-1">
            <h4 class="font-semibold">${escapeHtml(item.nombre)}</h4>
            <p class="text-white/70 text-sm">${escapeHtml(item.artista)}</p>
            <p class="text-emerald-400 font-bold">$${Number(item.precio).toFixed(2)} u.</p>
            <p class="text-white/60 text-sm">Código: ${escapeHtml(item.codigo)}</p>
            <p class="text-white/60 text-sm">Cant: ${item.cantidad}</p>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-white/90">Cant:</span>
            <button type="button" onclick="cart.updateQuantity(${item.id}, ${item.cantidad - 1})" class="px-2 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white">-</button>
            <span class="text-white/90 font-semibold px-3">${item.cantidad}</span>
            <button type="button" onclick="cart.updateQuantity(${item.id}, ${item.cantidad + 1})" class="px-2 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white">+</button>
            <button type="button" onclick="cart.remove(${item.id})" class="px-3 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `).join('');
      
      cartTotal.textContent = `$${data.items.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2)}`;
      
      lucide.createIcons();
    } catch (error) {
      loading.classList.add('hidden');
      empty.classList.remove('hidden');
      showError('Error', error.message);
    }
  },
  
  remove: function(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveToStorage();
  },
  
  clear: function() {
    this.items = [];
    this.saveToStorage();
  },
  
  getTotal: function() {
    return this.items.reduce((total, item) => total + (item.precio * item.quantity), 0);
  },
  
  saveToStorage: function() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  },
  
  loadFromStorage: function() {
    const stored = localStorage.getItem('cart');
    if (stored) {
      this.items = JSON.parse(stored);
    }
  },
  
  render: function() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (this.items.length === 0) {
      cartItems.innerHTML = '<p class="text-white/70 text-center py-8">Tu carrito está vacío.</p>';
      cartTotal.textContent = '$0.00';
      return;
    }
    
    cartItems.innerHTML = this.items.map(item => `
      <div class="glass-card p-4 flex items-center justify-between">
        <div class="flex-1">
          <h4 class="font-semibold">${item.nombre}</h4>
          <p class="text-white/70 text-sm">${item.artista}</p>
          <p class="text-emerald-400 font-bold">$${item.precio.toFixed(2)}</p>
          <p class="text-white/60 text-sm">Cantidad: ${item.quantity}</p>
        </div>
        <button type="button" onclick="cart.remove(${item.id})" class="px-3 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `).join('');
    
    cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
  }
};

function renderNav() {
  const nav = document.getElementById('nav-links') || document.querySelector('[data-nav]');
  if (!nav) return;
  const user = getCurrentUser();
  let html = '';
  if (isLoggedIn()) {
    html += `<span class="text-white/90 text-sm">${user?.nombre || user?.email || 'Usuario'}</span>`;
    html += `<a href="/cart.html" class="text-white/90 hover:text-white flex items-center gap-1"><i data-lucide="shopping-cart"></i> Carrito</a>`;
    html += `<a href="/orders.html" class="text-white/90 hover:text-white flex items-center gap-1"><i data-lucide="history"></i> Mis compras</a>`;
    if (user?.rol === 'admin') {
      html += `<a href="/admin.html" class="text-white/90 hover:text-white flex items-center gap-1"><i data-lucide="shield"></i> Admin</a>`;
    }
    html += `<button type="button" onclick="logout()" class="text-white/90 hover:text-white flex items-center gap-1"><i data-lucide="log-out"></i> Salir</button>`;
  } else {
    html += `<a href="/login.html" class="text-white/90 hover:text-white flex items-center gap-1"><i data-lucide="log-in"></i> Iniciar sesión</a>`;
    html += `<a href="/register.html" class="text-white/90 hover:text-white flex items-center gap-1"><i data-lucide="user-plus"></i> Registrarse</a>`;
  }
  nav.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Inicializar Lucide si existe
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  if (typeof lucide !== 'undefined') lucide.createIcons();
});
