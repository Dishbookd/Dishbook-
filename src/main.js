
import '../style.css';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const app = document.querySelector('#app');

let recipes = [];
let category = 'All';
let search = '';
let user = null;

const esc = (v = '') =>
  String(v).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));

function image(url) {
  return url || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80';
}

async function loadUser() {
  const { data } = await supabase.auth.getUser();
  user = data.user;
}

async function loadRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    recipes = [];
  } else {
    recipes = data || [];
  }
}

function header() {
  return `
    <header>
      <div class="brand">
        <b>DishBook</b>
        <small>Your recipe community</small>
      </div>
      <div class="headactions">
        ${
          user
            ? `<button class="account" id="logout">Logout</button>`
            : `<button id="login">Login</button>`
        }
      </div>
    </header>
  `;
}

function nav() {
  return `
    <nav>
      <button class="selected" id="homeNav">🏠<small>Home</small></button>
      <button id="addNav">➕<small>Add</small></button>
      <button id="authNav">${user ? '👤' : '🔐'}<small>${user ? 'Account' : 'Login'}</small></button>
    </nav>
  `;
}

function home() {
  const cats = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks'];

  const filtered = recipes.filter(r => {
    const text = `${r.title || ''} ${r.description || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCategory =
      category === 'All' ||
      String(r.category || '').toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  app.innerHTML = `
    ${header()}
    <main>
      <section class="hero">
        <h1>Cook. Share. Discover. 🍳</h1>
        <p>Find delicious recipes and share your favourite dishes with the DishBook community.</p>

        <div class="search">
          <span>⌕</span>
          <input id="search" placeholder="Search recipes..." value="${esc(search)}">
        </div>
      </section>

      <div class="cats">
        ${cats.map(c => `
          <button class="${category === c ? 'active' : ''}" data-cat="${c}">
            ${c}
          </button>
        `).join('')}
      </div>

      <div class="sectiontitle">
        <h2>Latest Recipes</h2>
        <span>${filtered.length} recipes</span>
      </div>

      <section class="grid">
        ${
          filtered.length
            ? filtered.map(recipeCard).join('')
            : `<div class="empty">No recipes found yet.<br>Be the first to add one!</div>`
        }
      </section>
    </main>
    ${nav()}
  `;

  document.querySelector('#search').addEventListener('input', e => {
    search = e.target.value;
    home();
  });

  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.onclick = () => {
      category = btn.dataset.cat;
      home();
    };
  });

  document.querySelectorAll('.card').forEach(card => {
    card.onclick = () => detail(card.dataset.id);
  });

  document.querySelector('#addNav').onclick = addRecipe;
  document.querySelector('#authNav').onclick = user ? account : login;
  document.querySelector('#login')?.addEventListener('click', login);
  document.querySelector('#logout')?.addEventListener('click', logout);
}

function recipeCard(r) {
  return `
    <article class="card" data-id="${esc(r.id)}">
      <img src="${esc(image(r.image_url))}" alt="${esc(r.title)}">
      <div class="cardbody">
        <span>${esc(r.category || 'Recipe')}</span>
        <h3>${esc(r.title || 'Untitled recipe')}</h3>
        <p>${esc(r.description || 'A delicious DishBook recipe.')}</p>
      </div>
    </article>
  `;
}

function detail(id) {
  const r = recipes.find(x => String(x.id) === String(id));
  if (!r) return home();

  const ingredients = Array.isArray(r.ingredients)
    ? r.ingredients
    : String(r.ingredients || '').split('\n').filter(Boolean);

  app.innerHTML = `
    ${header()}
    <main class="detail">
      <button class="back" id="back">← Back to recipes</button>

      <img class="detailimg" src="${esc(image(r.image_url))}" alt="${esc(r.title)}">

      <span class="pill">${esc(r.category || 'Recipe')}</span>
      <h1>${esc(r.title || 'Untitled recipe')}</h1>
      <p class="muted">${esc(r.description || '')}</p>

      <h2>Ingredients</h2>
      <ul>
        ${ingredients.map(x => `<li>${esc(x)}</li>`).join('')}
      </ul>

      <h2>Instructions</h2>
      <div class="instructions">${esc(r.instructions || r.steps || 'No instructions added.')}</div>
    </main>
    ${nav()}
  `;

  document.querySelector('#back').onclick = home;
  document.querySelector('#addNav').onclick = addRecipe;
  document.querySelector('#authNav').onclick = user ? account : login;
}

function login() {
  app.innerHTML = `
    ${header()}
    <main class="authpage">
      <section class="authbox">
        <div class="authlogo">🍽️</div>
        <h1>Welcome to DishBook</h1>
        <p class="muted">Login to share your recipes.</p>

        <form id="authForm">
          <label>
            Email
            <input id="email" type="email" required placeholder="you@example.com">
          </label>

          <label>
            Password
            <input id="password" type="password" required minlength="6" placeholder="••••••••">
          </label>

          <button class="primary" type="submit">Login / Sign Up</button>
        </form>

        <p id="authMessage" class="muted"></p>
      </section>
    </main>
  `;

  document.querySelector('#authForm').onsubmit = async e => {
    e.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;

    const message = document.querySelector('#authMessage');
    message.textContent = 'Please wait...';

    let result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) {
      message.textContent = result.error.message;
      return;
    }

    await loadUser();
    home();
  };
}

async function logout() {
  await supabase.auth.signOut();
  user = null;
  home();
}

function account() {
  app.innerHTML = `
    ${header()}
    <main class="formpage">
      <h1>Your Account</h1>
      <form>
        <p><b>Email</b></p>
        <p class="muted">${esc(user?.email || '')}</p>
        <button class="primary" id="accountLogout">Logout</button>
      </form>
    </main>
    ${nav()}
  `;

  document.querySelector('#accountLogout').onclick = logout;
  document.querySelector('#addNav').onclick = addRecipe;
}

function addRecipe() {
  if (!user) {
    login();
    return;
  }

  app.innerHTML = `
    ${header()}
    <main class="formpage">
      <button class="back" id="back">← Back</button>
      <h1>Add a Recipe 🍴</h1>

      <form id="recipeForm">
        <label>
          Recipe name
          <input id="title" required placeholder="Chicken Curry">
        </label>

        <label>
          Description
          <input id="description" placeholder="A short description">
        </label>

        <div class="two">
          <label>
            Category
            <select id="category">
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Dessert</option>
              <option>Drinks</option>
            </select>
          </label>

          <label>
            Photo URL
            <input id="image_url" placeholder="https://...">
          </label>
        </div>

        <label>
          Ingredients
          <textarea id="ingredients" required placeholder="1 onion&#10;2 tomatoes&#10;1 tsp salt"></textarea>
        </label>

        <label>
          Instructions
          <textarea id="instructions" required placeholder="Step 1...&#10;Step 2..."></textarea>
        </label>

        <button class="primary" type="submit">Publish Recipe</button>
        <p id="formMessage" class="muted"></p>
      </form>
    </main>
    ${nav()}
  `;

  document.querySelector('#back').onclick = home;
  onsubmit = async e => {
  e.preventDefault();

  const msg = document.querySelector('#formMessage');
  msg.textContent = 'Publishing...';

  const { error } = await supabase.from('recipes').insert({
    user_id: user.id,
    title: document.querySelector('#title').value.trim(),
    description: document.querySelector('#description').value.trim(),
    category: document.querySelector('#category').value,
    image_url: document.querySelector('#image_url').value.trim(),
    ingredients: document.querySelector('#ingredients').value.trim(),
    instructions: document.querySelector('#instructions').value.trim()
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  await loadRecipes();
  home();
};

}

async function start() {
  await loadUser();
  await loadRecipes();
  home();
}

supabase.auth.onAuthStateChange((_event, session) => {
  user = session?.user || null;
});

start();
