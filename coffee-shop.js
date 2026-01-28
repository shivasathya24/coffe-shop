const products = [
  {
    id: "espresso1",
    name: "Classic Espresso Shot",
    category: "espresso",
    description: "Double shot, rich crema, perfectly extracted.",
    price: 190,
    tag: "Signature",
    size: "Short",
  },
  {
    id: "espresso2",
    name: "Vanilla Oat Latte",
    category: "espresso",
    description: "Velvety oat milk, house vanilla, blonde espresso.",
    price: 310,
    tag: "Best seller",
    size: "Tall",
  },
  {
    id: "cold1",
    name: "Brown Sugar Cold Brew",
    category: "cold-brew",
    description: "Slow-steeped brew, brown sugar syrup, cream cloud.",
    price: 280,
    tag: "Iced",
    size: "Grande",
  },
  {
    id: "cold2",
    name: "Caramel Cloud Cold Brew",
    category: "cold-brew",
    description: "Caramel foam, vanilla sweet cream, extra smooth.",
    price: 320,
    tag: "New",
    size: "Grande",
  },
  {
    id: "frappe1",
    name: "Dark Mocha Frappe",
    category: "frappes",
    description: "Blended espresso, dark cocoa, whipped cream.",
    price: 340,
    tag: "Indulgent",
    size: "Venti",
  },
  {
    id: "frappe2",
    name: "Caramel Crunch Frappe",
    category: "frappes",
    description: "Buttery caramel, crunchy topping, icy blend.",
    price: 345,
    tag: "Crunch",
    size: "Venti",
  },
  {
    id: "pastry1",
    name: "Almond Croissant",
    category: "pastries",
    description: "Buttery layers with toasted almond frangipane.",
    price: 230,
    tag: "Fresh",
    size: "One size",
  },
  {
    id: "pastry2",
    name: "Dark Chocolate Cookie",
    category: "pastries",
    description: "Soft-baked, sea salt, melted chocolate chunks.",
    price: 190,
    tag: "Warm",
    size: "One size",
  },
];

let cart = [];
let loggedInEmail = null;

document.addEventListener("DOMContentLoaded", () => {
  hydrateLogin();
  renderMenu("all");
  setUpCategoryFilters();
  setUpScrollButtons();
  initCartUI();
  initAuthModal();
  initPaymentModal();
});

function hydrateLogin() {
  const saved = localStorage.getItem("bb_user_email");
  if (saved) {
    loggedInEmail = saved;
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.textContent = saved.split("@")[0];
    }
  }
}

function renderMenu(filter) {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  const filtered =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  grid.innerHTML = filtered
    .map(
      (p) => `
      <article class="drink-card">
        <span class="drink-tag">${p.tag}</span>
        <div class="drink-name">${p.name}</div>
        <p class="drink-meta">
          <span>${p.size}</span>
          <span class="drink-price">₹${p.price.toFixed(2)}</span>
        </p>
        <p class="drink-meta">${p.description}</p>
        <div class="drink-actions">
          <button class="secondary-btn" data-add-one data-id="${p.id}">Add</button>
          <button class="ghost-btn" data-add-two data-id="${p.id}">+2</button>
        </div>
      </article>
    `
    )
    .join("");

  grid.querySelectorAll("[data-add-one]").forEach((btn) =>
    btn.addEventListener("click", () => addToCart(btn.dataset.id, 1))
  );
  grid.querySelectorAll("[data-add-two]").forEach((btn) =>
    btn.addEventListener("click", () => addToCart(btn.dataset.id, 2))
  );
}

function setUpCategoryFilters() {
  const chips = document.querySelectorAll("#categoryChips .chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderMenu(chip.dataset.category);
    });
  });
}

function setUpScrollButtons() {
  document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  const featuredQuickAdd = document.querySelector("[data-add-featured]");
  if (featuredQuickAdd) {
    featuredQuickAdd.addEventListener("click", () => addToCart("cold2", 1));
  }
}

function initCartUI() {
  const cartBtn = document.getElementById("cartBtn");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeCart = document.getElementById("closeCart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  [cartBtn, cartOverlay, closeCart].forEach((el) => {
    if (!el) return;
    el.addEventListener("click", () => {
      if (!cartDrawer) return;
      cartDrawer.classList.toggle("open");
      cartDrawer.setAttribute(
        "aria-hidden",
        cartDrawer.classList.contains("open") ? "false" : "true"
      );
    });
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) {
        alert("Your cart is empty.");
        return;
      }
      openPaymentModal();
    });
  }

  const stored = localStorage.getItem("bb_cart");
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch {
      cart = [];
    }
  }
  renderCart();
}

function addToCart(id, qty) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, size: product.size, quantity: qty });
  }
  persistCart();
  renderCart();
}

function changeQuantity(id, delta) {
  const index = cart.findIndex((item) => item.id === id);
  if (index === -1) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  persistCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  persistCart();
  renderCart();
}

function persistCart() {
  localStorage.setItem("bb_cart", JSON.stringify(cart));
}

function renderCart() {
  const itemsContainer = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("cartSubtotal");
  if (!itemsContainer || !countEl || !subtotalEl) return;

  if (!cart.length) {
    itemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. Add something delicious ☕</p>';
  } else {
    itemsContainer.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-meta">${item.size} · ₹${item.price.toFixed(2)}</div>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-qty-minus="${item.id}">−</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-qty-plus="${item.id}">+</button>
          </div>
          <button class="remove-btn" data-remove="${item.id}">Remove</button>
        </div>
      `
      )
      .join("");

    itemsContainer.querySelectorAll("[data-qty-minus]").forEach((btn) =>
      btn.addEventListener("click", () => changeQuantity(btn.dataset.qtyMinus, -1))
    );
    itemsContainer.querySelectorAll("[data-qty-plus]").forEach((btn) =>
      btn.addEventListener("click", () => changeQuantity(btn.dataset.qtyPlus, 1))
    );
    itemsContainer.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => removeFromCart(btn.dataset.remove))
    );
  }

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  countEl.textContent = count;
  subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
}

function initAuthModal() {
  const modal = document.getElementById("authModal");
  const overlay = document.getElementById("authOverlay");
  const closeBtn = document.getElementById("authClose");
  const loginBtn = document.getElementById("loginBtn");
  const joinBtn = document.getElementById("joinBtn");
  const form = document.getElementById("authForm");

  const toggle = (open) => {
    if (!modal) return;
    if (open) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    } else {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  };

  [loginBtn, joinBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => toggle(true));
  });
  [overlay, closeBtn].forEach((el) => {
    if (!el) return;
    el.addEventListener("click", () => toggle(false));
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("authEmail").value.trim();
      if (!email) return;
      loggedInEmail = email;
      localStorage.setItem("bb_user_email", email);
      if (loginBtn) {
        loginBtn.textContent = email.split("@")[0];
      }
      toggle(false);
      alert("Signed in (demo only).");
    });
  }
}

function initPaymentModal() {
  const modal = document.getElementById("paymentModal");
  const overlay = document.getElementById("paymentOverlay");
  const closeBtn = document.getElementById("paymentClose");
  const form = document.getElementById("paymentForm");

  const toggle = (open) => {
    if (!modal) return;
    if (open) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    } else {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  };

  [overlay, closeBtn].forEach((el) => {
    if (!el) return;
    el.addEventListener("click", () => toggle(false));
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Demo payment successful! In a real app you'd now call a payment gateway API.");
      cart = [];
      persistCart();
      renderCart();
      toggle(false);
      const cartDrawer = document.getElementById("cartDrawer");
      if (cartDrawer) {
        cartDrawer.classList.remove("open");
        cartDrawer.setAttribute("aria-hidden", "true");
      }
    });
  }
}

function openPaymentModal() {
  const modal = document.getElementById("paymentModal");
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}


