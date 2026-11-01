document.addEventListener('DOMContentLoaded', () => {
  const state = {
    client: null,
    user: null,
    menu: [],
    menuReady: false,
    cartId: null,
  };

  const page = document.body.dataset.page;
  const toast = document.querySelector('.toast') || document.createElement('div');
  if (!toast.isConnected) {
    toast.className = 'toast';
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }

  const status = document.createElement('p');
  status.className = 'backend-status';
  status.setAttribute('role', 'status');
  status.hidden = true;
  document.querySelector('.page-shell main')?.prepend(status);

  const reportError = (error) => {
    const message = error instanceof Error ? error.message : String(error);
    status.textContent = `Backend error: ${message}`;
    status.hidden = false;
    console.error(error);
    showToast(message, true);
  };

  let toastTimer;
  const showToast = (message, isError = false) => {
    toast.textContent = message;
    toast.classList.toggle('toast-error', isError);
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
  };

  const escapeText = (value) => String(value ?? '');
  const formatPrice = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

  document.querySelectorAll('.nav-item').forEach((item) => {
    const href = item.getAttribute('href');
    if (page && href && href.includes(`${page}.html`)) {
      item.classList.add('active');
    }
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });

  const topActions = document.querySelector('.top-actions');
  if (topActions) {
    topActions.querySelector('.icon-badge')?.remove();
    const accountButton = document.createElement('button');
    accountButton.className = 'backend-action account-trigger';
    accountButton.type = 'button';
    accountButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">person</span>';
    accountButton.setAttribute('aria-label', 'Open account');
    accountButton.addEventListener('click', () => openAccount());

    const cartButton = document.createElement('button');
    cartButton.className = 'backend-action cart-trigger';
    cartButton.type = 'button';
    cartButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">shopping_bag</span><span class="cart-count" aria-live="polite">0</span>';
    cartButton.addEventListener('click', () => openCart());
    topActions.append(accountButton, cartButton);
  }

  const accountModal = document.createElement('div');
  accountModal.className = 'backend-overlay';
  accountModal.hidden = true;
  accountModal.innerHTML = `
    <section class="backend-dialog" role="dialog" aria-modal="true" aria-labelledby="accountTitle" tabindex="-1">
      <div class="dialog-heading">
        <h2 id="accountTitle">Your account</h2>
        <button class="dialog-close" type="button" data-close-dialog aria-label="Close">×</button>
      </div>
      <div class="account-auth">
        <div class="auth-tabs" role="group" aria-label="Account action">
          <button type="button" class="auth-tab active" data-auth-mode="signin">Sign in</button>
          <button type="button" class="auth-tab" data-auth-mode="signup">Create account</button>
        </div>
        <form class="form-grid auth-form">
          <div class="field signup-only" hidden>
            <label for="authName">Full name</label>
            <input id="authName" name="full_name" autocomplete="name" maxlength="120" required />
          </div>
          <div class="field">
            <label for="authEmail">Email</label>
            <input id="authEmail" name="email" type="email" autocomplete="email" maxlength="254" required />
          </div>
          <div class="field">
            <label for="authPassword">Password</label>
            <input id="authPassword" name="password" type="password" autocomplete="current-password" minlength="8" required />
          </div>
          <p class="dialog-message" aria-live="polite"></p>
          <button class="primary-btn" type="submit">Sign in</button>
        </form>
      </div>
      <div class="account-profile" hidden>
        <p class="account-email"></p>
        <form class="form-grid profile-form">
          <div class="field">
            <label for="profileName">Full name</label>
            <input id="profileName" name="full_name" autocomplete="name" maxlength="120" required />
          </div>
          <div class="field">
            <label for="profilePhone">Phone</label>
            <input id="profilePhone" name="phone" type="tel" autocomplete="tel" maxlength="32" />
          </div>
          <button class="primary-btn" type="submit">Save profile</button>
        </form>
        <div class="order-history">
          <h3>Recent orders</h3>
          <div class="order-list"></div>
        </div>
        <button class="secondary-btn signout-button" type="button">Sign out</button>
      </div>
    </section>`;
  document.body.append(accountModal);

  const cartModal = document.createElement('div');
  cartModal.className = 'backend-overlay';
  cartModal.hidden = true;
  cartModal.innerHTML = `
    <section class="backend-dialog" role="dialog" aria-modal="true" aria-labelledby="cartTitle" tabindex="-1">
      <div class="dialog-heading">
        <h2 id="cartTitle">Your cart</h2>
        <button class="dialog-close" type="button" data-close-dialog aria-label="Close">×</button>
      </div>
      <p class="cart-message" aria-live="polite"></p>
      <div class="cart-lines"></div>
      <div class="cart-total"><span>Subtotal</span><strong>₦0</strong></div>
      <form class="form-grid checkout-form">
        <h3>Delivery details</h3>
        <div class="field">
          <label for="deliveryAddress">Delivery address</label>
          <textarea id="deliveryAddress" name="delivery_address" minlength="5" maxlength="500" required></textarea>
        </div>
        <div class="field">
          <label for="deliveryPhone">Phone</label>
          <input id="deliveryPhone" name="phone" type="tel" autocomplete="tel" minlength="5" maxlength="32" required />
        </div>
        <div class="field">
          <label for="orderNotes">Order notes (optional)</label>
          <textarea id="orderNotes" name="notes" maxlength="500"></textarea>
        </div>
        <p class="checkout-payment">Payment: cash on delivery</p>
        <button class="primary-btn checkout-button" type="submit">Place order</button>
      </form>
    </section>`;
  document.body.append(cartModal);

  const closeDialogs = () => {
    accountModal.hidden = true;
    cartModal.hidden = true;
  };

  document.querySelectorAll('.backend-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('[data-close-dialog]')) {
        overlay.hidden = true;
      }
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDialogs();
  });

  const setAuthMode = (mode) => {
    accountModal.querySelectorAll('[data-auth-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.authMode === mode);
    });
    const nameField = accountModal.querySelector('.signup-only');
    const password = accountModal.querySelector('#authPassword');
    const submit = accountModal.querySelector('.auth-form button[type="submit"]');
    nameField.hidden = mode !== 'signup';
    nameField.querySelector('input').required = mode === 'signup';
    password.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
    password.minLength = mode === 'signup' ? 8 : 1;
    submit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
    accountModal.querySelector('.dialog-message').textContent = '';
  };

  accountModal.querySelectorAll('[data-auth-mode]').forEach((button) => {
    button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
  });
  setAuthMode('signin');

  const updateAccountView = () => {
    const signedIn = Boolean(state.user);
    accountModal.querySelector('.account-auth').hidden = signedIn;
    accountModal.querySelector('.account-profile').hidden = !signedIn;
    accountModal.querySelector('.account-email').textContent = state.user?.email || '';
    document.querySelector('.account-trigger')?.setAttribute(
      'aria-label',
      signedIn ? 'Open my account' : 'Sign in to your account',
    );
  };

  const loadProfileAndOrders = async () => {
    if (!state.user || !state.client) return;
    const { data: profile, error: profileError } = await state.client
      .from('profiles')
      .select('full_name, phone')
      .eq('id', state.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    accountModal.querySelector('#profileName').value = profile?.full_name || '';
    accountModal.querySelector('#profilePhone').value = profile?.phone || '';

    const { data: orders, error: ordersError } = await state.client
      .from('orders')
      .select('id, status, total_ngn, created_at, order_items(item_name, quantity, line_total_ngn)')
      .eq('user_id', state.user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (ordersError) throw ordersError;

    const orderList = accountModal.querySelector('.order-list');
    orderList.replaceChildren();
    if (!orders?.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No orders yet.';
      orderList.append(empty);
      return;
    }

    orders.forEach((order) => {
      const article = document.createElement('article');
      article.className = 'order-entry';
      const heading = document.createElement('strong');
      heading.textContent = `${formatPrice(order.total_ngn)} · ${escapeText(order.status)}`;
      const date = document.createElement('span');
      date.textContent = new Date(order.created_at).toLocaleString();
      const items = document.createElement('p');
      items.textContent = (order.order_items || [])
        .map((item) => `${item.quantity} × ${item.item_name}`)
        .join(', ');
      article.append(heading, date, items);
      orderList.append(article);
    });
  };

  const openAccount = async () => {
    closeDialogs();
    accountModal.hidden = false;
    accountModal.querySelector('.backend-dialog').focus();
    updateAccountView();
    if (state.user) {
      try {
        await loadProfileAndOrders();
      } catch (error) {
        reportError(error);
      }
    }
  };

  accountModal.querySelector('.auth-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.client) return reportError(new Error('Supabase is not connected.'));

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim();
    const password = String(form.get('password'));
    const isSignup = accountModal.querySelector('[data-auth-mode="signup"]').classList.contains('active');
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    const message = accountModal.querySelector('.dialog-message');
    submit.disabled = true;
    message.textContent = '';

    try {
      if (isSignup) {
        const { data, error } = await state.client.auth.signUp({
          email,
          password,
          options: { data: { full_name: String(form.get('full_name')).trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          message.textContent = 'Check your email to confirm your account, then sign in.';
        } else {
          message.textContent = 'Account created.';
          await loadProfileAndOrders();
        }
      } else {
        const { error } = await state.client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        message.textContent = 'Signed in successfully.';
        await loadProfileAndOrders();
      }
    } catch (error) {
      message.textContent = error instanceof Error ? error.message : String(error);
    } finally {
      submit.disabled = false;
    }
  });

  accountModal.querySelector('.profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.user || !state.client) return;
    const form = new FormData(event.currentTarget);
    try {
      const { error } = await state.client
        .from('profiles')
        .update({
          full_name: String(form.get('full_name')).trim(),
          phone: String(form.get('phone')).trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id);
      if (error) throw error;
      showToast('Profile saved.');
    } catch (error) {
      reportError(error);
    }
  });

  accountModal.querySelector('.signout-button').addEventListener('click', async () => {
    if (!state.client) return;
    try {
      const { error } = await state.client.auth.signOut();
      if (error) throw error;
      accountModal.hidden = true;
      showToast('You have signed out.');
    } catch (error) {
      reportError(error);
    }
  });

  const getCart = async (create = false) => {
    if (!state.user || !state.client) throw new Error('Sign in to use your cart.');
    if (!create) {
      const { data, error } = await state.client
        .from('carts')
        .select('id')
        .eq('user_id', state.user.id)
        .maybeSingle();
      if (error) throw error;
      state.cartId = data?.id || null;
      return state.cartId;
    }
    const { data, error } = await state.client
      .from('carts')
      .upsert({ user_id: state.user.id }, { onConflict: 'user_id' })
      .select('id')
      .single();
    if (error) throw error;
    state.cartId = data.id;
    return state.cartId;
  };

  const fetchCartItems = async () => {
    const cartId = await getCart(false);
    if (!cartId) return [];
    const { data, error } = await state.client
      .from('cart_items')
      .select('id, quantity, menu_item_id, menu_items(name, price_ngn, is_active, is_available)')
      .eq('cart_id', cartId)
      .order('created_at');
    if (error) throw error;
    return data || [];
  };

  const updateCartCount = async () => {
    const button = document.querySelector('.cart-trigger .cart-count');
    if (!button) return;
    if (!state.user || !state.client) {
      button.textContent = '0';
      button.closest('.cart-trigger')?.setAttribute('aria-label', 'Open cart, 0 items');
      return;
    }
    const items = await fetchCartItems();
    const count = items.reduce((total, item) => total + item.quantity, 0);
    button.textContent = String(count);
    button.closest('.cart-trigger')?.setAttribute('aria-label', `Open cart, ${count} items`);
  };

  const addToCart = async (slug) => {
    if (!state.client) throw new Error('Supabase is not connected.');
    if (!state.user) {
      await openAccount();
      showToast('Sign in or create an account to add items to your cart.');
      return;
    }
    const menuItem = state.menu.find((item) => item.slug === slug);
    if (!menuItem) throw new Error('That menu item is unavailable. Refresh the page and try again.');
    const cartId = await getCart(true);
    const { data: existing, error: lookupError } = await state.client
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('menu_item_id', menuItem.id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    const result = existing
      ? await state.client.from('cart_items').update({ quantity: Math.min(existing.quantity + 1, 20) }).eq('id', existing.id)
      : await state.client.from('cart_items').insert({ cart_id: cartId, menu_item_id: menuItem.id, quantity: 1 });
    if (result.error) throw result.error;
    await updateCartCount();
    showToast(`${menuItem.name} added to your cart.`);
  };

  const makeCartLine = (item) => {
    const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
    const row = document.createElement('article');
    row.className = 'cart-line';
    const details = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = menuItem?.name || 'Unavailable item';
    const price = document.createElement('span');
    price.textContent = menuItem ? formatPrice(menuItem.price_ngn * item.quantity) : 'Unavailable';
    details.append(name, price);

    const controls = document.createElement('div');
    controls.className = 'cart-quantity';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '−';
    remove.setAttribute('aria-label', 'Remove one');
    remove.dataset.cartAction = 'decrease';
    remove.dataset.cartItemId = item.id;
    const quantity = document.createElement('span');
    quantity.textContent = String(item.quantity);
    const add = document.createElement('button');
    add.type = 'button';
    add.textContent = '+';
    add.setAttribute('aria-label', 'Add one');
    add.dataset.cartAction = 'increase';
    add.dataset.cartItemId = item.id;
    controls.append(remove, quantity, add);
    row.append(details, controls);
    return row;
  };

  const renderCart = async () => {
    const lines = cartModal.querySelector('.cart-lines');
    const message = cartModal.querySelector('.cart-message');
    const checkout = cartModal.querySelector('.checkout-form');
    const total = cartModal.querySelector('.cart-total strong');
    if (!state.user) {
      lines.replaceChildren();
      total.textContent = formatPrice(0);
      checkout.hidden = true;
      message.textContent = 'Sign in to save your cart and place an order.';
      return;
    }
    const items = await fetchCartItems();
    lines.replaceChildren();
    if (!items.length) {
      message.textContent = 'Your cart is empty. Add something tasty from the menu.';
    } else {
      message.textContent = '';
      items.forEach((item) => lines.append(makeCartLine(item)));
    }
    const subtotal = items.reduce((sum, item) => {
      const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
      return sum + (menuItem?.is_active && menuItem?.is_available ? menuItem.price_ngn * item.quantity : 0);
    }, 0);
    total.textContent = formatPrice(subtotal);
    checkout.hidden = !items.length;
    const profilePhone = accountModal.querySelector('#profilePhone').value;
    if (profilePhone && !cartModal.querySelector('#deliveryPhone').value) {
      cartModal.querySelector('#deliveryPhone').value = profilePhone;
    }
  };

  const openCart = async () => {
    closeDialogs();
    cartModal.hidden = false;
    cartModal.querySelector('.backend-dialog').focus();
    if (!state.user) {
      await renderCart();
      return;
    }
    try {
      await renderCart();
    } catch (error) {
      reportError(error);
    }
  };

  cartModal.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button || !state.client) return;
    button.disabled = true;
    try {
      const action = button.dataset.cartAction;
      const itemId = button.dataset.cartItemId;
      if (action === 'increase') {
        const { data, error } = await state.client.from('cart_items').select('quantity').eq('id', itemId).single();
        if (error) throw error;
        if (data.quantity < 20) {
          const { error: updateError } = await state.client.from('cart_items').update({ quantity: data.quantity + 1 }).eq('id', itemId);
          if (updateError) throw updateError;
        }
      } else {
        const { data, error } = await state.client.from('cart_items').select('quantity').eq('id', itemId).single();
        if (error) throw error;
        if (action === 'decrease' && data.quantity > 1) {
          const { error: updateError } = await state.client.from('cart_items').update({ quantity: data.quantity - 1 }).eq('id', itemId);
          if (updateError) throw updateError;
        } else {
          const { error: deleteError } = await state.client.from('cart_items').delete().eq('id', itemId);
          if (deleteError) throw deleteError;
        }
      }
      await renderCart();
      await updateCartCount();
    } catch (error) {
      reportError(error);
    }
  });

  cartModal.querySelector('.checkout-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.client || !state.user) return reportError(new Error('Sign in to place an order.'));
    const checkoutForm = event.currentTarget;
    const form = new FormData(checkoutForm);
    const submit = checkoutForm.querySelector('.checkout-button');
    submit.disabled = true;
    try {
      const { data: orderId, error } = await state.client.rpc('place_order', {
        p_delivery_address: String(form.get('delivery_address')).trim(),
        p_phone: String(form.get('phone')).trim(),
        p_notes: String(form.get('notes')).trim() || null,
      });
      if (error) throw error;
      checkoutForm.reset();
      await updateCartCount();
      await renderCart();
      showToast(`Order placed. Reference: ${String(orderId).slice(0, 8)}`);
      cartModal.hidden = true;
    } catch (error) {
      reportError(error);
    } finally {
      submit.disabled = false;
    }
  });

  const setPurchaseButtonsEnabled = (enabled) => {
    document.querySelectorAll('.add-button, [data-add-slug]').forEach((button) => {
      button.disabled = !enabled;
    });
  };
  setPurchaseButtonsEnabled(false);

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('.add-button, [data-add-slug]');
    if (!button) return;
    const slug = button.dataset.addSlug || button.closest('[data-menu-slug]')?.dataset.menuSlug;
    if (!slug) return;
    button.disabled = true;
    try {
      await addToCart(slug);
    } catch (error) {
      reportError(error);
    } finally {
      button.disabled = !state.menuReady;
    }
  });

  const getCategoryName = (item) => {
    const category = Array.isArray(item.menu_categories) ? item.menu_categories[0] : item.menu_categories;
    return category?.name || 'Menu';
  };

  const makeProductCard = (item) => {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.menuSlug = item.slug;

    const imageBox = document.createElement('div');
    imageBox.className = 'product-image';
    const image = document.createElement('img');
    const imagePath = String(item.image_path || '');
    image.src = /^images\/[a-zA-Z0-9 ()_.-]+$/.test(imagePath)
      ? imagePath
      : 'images/WhatsApp Image 2026-10-28 at 1.30.37 PM (1).jpeg';
    image.alt = item.name;
    image.loading = 'lazy';
    const tag = document.createElement('span');
    tag.className = 'product-tag';
    tag.textContent = getCategoryName(item);
    imageBox.append(image, tag);

    const name = document.createElement('h5');
    name.textContent = item.name;
    const description = document.createElement('p');
    description.textContent = item.description || '';
    const bottom = document.createElement('div');
    bottom.className = 'product-bottom';
    const price = document.createElement('strong');
    price.textContent = formatPrice(item.price_ngn);
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'add-button';
    addButton.setAttribute('aria-label', `Add ${item.name} to cart`);
    addButton.dataset.addSlug = item.slug;
    addButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">add</span>';
    bottom.append(price, addButton);
    article.append(imageBox, name, description, bottom);
    return article;
  };

  const loadMenu = async () => {
    const { data, error } = await state.client
      .from('menu_items')
      .select('id, category_id, slug, name, description, price_ngn, image_path, menu_categories(name)')
      .eq('is_active', true)
      .eq('is_available', true)
      .order('created_at', { ascending: true });
    if (error) throw error;
    state.menu = data || [];

    document.querySelectorAll('.product-grid').forEach((grid) => {
      grid.replaceChildren(...state.menu.map(makeProductCard));
    });

    const featuredItems = {
      'crispy-broast-bucket': document.querySelectorAll('.feature-card')[0],
      'spicy-zinger-stack': document.querySelectorAll('.feature-card')[1],
    };
    Object.entries(featuredItems).forEach(([slug, card]) => {
      const item = state.menu.find((menuItem) => menuItem.slug === slug);
      if (!item || !card) return;
      card.dataset.menuSlug = slug;
      const price = card.querySelector('.price-block strong');
      if (price) price.textContent = formatPrice(item.price_ngn);
      const button = card.querySelector('.primary-btn');
      if (button) {
        button.dataset.addSlug = slug;
        button.setAttribute('aria-label', `Add ${item.name} to cart`);
      }
    });

    state.menuReady = state.menu.length > 0;
    setPurchaseButtonsEnabled(state.menuReady);
    if (state.menuReady) {
      status.hidden = true;
    } else {
      status.textContent = 'Supabase is connected, but there are no available menu items. Add items to public.menu_items and mark them active and available.';
      status.hidden = false;
    }
  };

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((element) => element.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.textContent.trim().toLowerCase();
      document.querySelectorAll('.product-card').forEach((card) => {
        const item = state.menu.find((entry) => entry.slug === card.dataset.menuSlug);
        const category = item ? getCategoryName(item).toLowerCase() : '';
        const target = filter.replace(/s$/, '');
        card.hidden = filter !== 'all' && !category.includes(target) && !target.includes(category);
      });
    });
  });

  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!state.client) return reportError(new Error('Supabase is not connected.'));
      const form = new FormData(contactForm);
      const submit = contactForm.querySelector('button[type="submit"]');
      submit.disabled = true;
      try {
        const { error } = await state.client.from('contact_messages').insert({
          full_name: String(form.get('name')).trim(),
          email: String(form.get('email')).trim(),
          message: String(form.get('message')).trim(),
        });
        if (error) throw error;
        contactForm.reset();
        showToast('Message sent successfully.');
      } catch (error) {
        reportError(error);
      } finally {
        submit.disabled = false;
      }
    });
  }

  const initializeBackend = async () => {
    try {
      if (!window.supabase?.createClient) {
        throw new Error('Supabase client library did not load. Check the network and refresh.');
      }
      const response = await fetch('/api/config', { cache: 'no-store' });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Backend configuration request failed (${response.status}).`);
      }
      const config = await response.json();
      const projectUrl = new URL(config.url);
      if (projectUrl.protocol !== 'https:' || !config.anonKey) {
        throw new Error('The public Supabase URL or anon key is not configured correctly in Vercel.');
      }
      state.client = window.supabase.createClient(config.url, config.anonKey);

      state.client.auth.onAuthStateChange((event, session) => {
        window.setTimeout(() => {
          state.user = session?.user || null;
          state.cartId = null;
          updateAccountView();
          updateCartCount().catch(reportError);
          if (state.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            loadProfileAndOrders().catch(reportError);
          }
        }, 0);
      });

      const { data, error } = await state.client.auth.getSession();
      if (error) throw error;
      state.user = data.session?.user || null;
      updateAccountView();
      await loadMenu();
      await updateCartCount();
    } catch (error) {
      setPurchaseButtonsEnabled(false);
      reportError(error);
    }
  };

  initializeBackend();
});
