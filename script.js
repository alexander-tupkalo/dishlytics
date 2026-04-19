/* ═══════════════════════════════════════════════════════════════════
   DISHLYTICS  •  script.js  (Final — PRO Modal + Waitlist + i18n)
   ═══════════════════════════════════════════════════════════════════

   To connect a real AI:
     const USE_REAL_AI    = true;
     const OPENAI_API_KEY = 'sk-...';
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════════════════════════════
   ★  SECTION 1 — MULTI-TIER ACCESS CONTROL
   ══════════════════════════════════════════════════════════════════
   Tiers: FREE (Commis) | PRO / Sous-Chef ($7) | EXECUTIVE ($14)
   Source of truth: localStorage key 'dl_user_tier'
   Swap for JWT / Supabase session claim in production.
   ══════════════════════════════════════════════════════════════════ */

/** Tier constants — never hard-code strings elsewhere */
const TIER = Object.freeze({ FREE:'FREE', PRO:'PRO', EXECUTIVE:'EXECUTIVE' });

/** Numeric rank for easy comparison */
const TIER_RANK = { FREE:0, PRO:1, EXECUTIVE:2 };

/**
 * Feature gates — every guarded feature listed here once.
 * Add new features to this map; checkFeatureAccess() handles the rest.
 */
const FEATURE_GATES = {
  // Recipe limits
  unlimited_recipes:     TIER.PRO,
  // Calculator
  pf_sub_recipes:        TIER.EXECUTIVE,
  supplier_management:   TIER.EXECUTIVE,
  // AI
  basic_ai:              TIER.PRO,
  voice_input:           TIER.EXECUTIVE,
  menu_text_gen:         TIER.EXECUTIVE,
  advanced_ai:           TIER.EXECUTIVE,
  // Export
  pdf_export:            TIER.PRO,
  custom_logo_pdf:       TIER.EXECUTIVE,
  // Sync
  cloud_sync:            TIER.PRO,
  // Market tab
  market_price_sync:     TIER.PRO,
};

/** Hard limit on saved recipes for FREE tier */
const FREE_RECIPE_LIMIT = 5;

/** Read current tier from localStorage (or default FREE) */
function getCurrentTier() {
  try {
    const stored = localStorage.getItem('dl_user_tier');
    return Object.values(TIER).includes(stored) ? stored : TIER.FREE;
  } catch(e) { return TIER.FREE; }
}

/** Persist tier (call from payment webhook or manual upgrade flow) */
function setCurrentTier(tier) {
  if (!Object.values(TIER).includes(tier)) return;
  try { localStorage.setItem('dl_user_tier', tier); } catch(e) {}
  applyTierUI();
}

/**
 * checkFeatureAccess(featureName)
 * Returns true if user can use this feature.
 * Call before any gated operation.
 *
 * @param {string}  featureName  — key from FEATURE_GATES
 * @param {boolean} showModal    — open upgrade modal on failure (default true)
 * @returns {boolean}
 */
function checkFeatureAccess(featureName, showModal = true) {
  const required  = FEATURE_GATES[featureName];
  const userRank  = TIER_RANK[getCurrentTier()] ?? 0;
  const needRank  = TIER_RANK[required]         ?? 0;
  if (userRank >= needRank) return true;

  if (showModal) {
    // Highlight the correct tier in the modal
    _pendingUpgradeFeature = featureName;
    openProModal(required);
  }
  return false;
}

/** Feature currently waiting for upgrade (used by modal to highlight tier) */
let _pendingUpgradeFeature = null;

/**
 * applyTierUI()
 * Re-renders all tier-dependent UI elements.
 * Call after tier changes or on page load.
 */
function applyTierUI() {
  const tier   = getCurrentTier();
  const rank   = TIER_RANK[tier];
  const symbol = ['🥉','🥈','🥇'][rank] || '';

  // Header auth pill
  const authPill = document.getElementById('authPill');
  if (authPill) {
    const labels = {FREE:'Free',PRO:'PRO',EXECUTIVE:'Executive'};
    authPill.textContent = symbol + ' ' + (labels[tier] || tier);
    authPill.className = 'auth-pill auth-pill-' + tier.toLowerCase();
  }

  // Tier badge in sidebar card
  const tierBadge = document.getElementById('tierBadgeText');
  if (tierBadge) {
    const map = {
      FREE:      t('tier_free_badge')  || 'Commis',
      PRO:       t('tier_pro_name')    || 'Sous-Chef',
      EXECUTIVE: t('tier_exec_name')   || 'Chef de Cuisine',
    };
    tierBadge.textContent = map[tier];
    tierBadge.className   = 'tier-badge ' + tier.toLowerCase();
  }

  // Limit message in sidebar
  const limitMsg = document.getElementById('tierLimitMsg');
  if (limitMsg) {
    const msgs = {
      FREE:      t('tier_limit_msg')      || `${FREE_RECIPE_LIMIT} recipes · No AI`,
      PRO:       t('tier_pro_limit_msg')  || 'Unlimited · Basic AI · PDF',
      EXECUTIVE: t('tier_exec_limit_msg') || 'Full access · Voice AI · P/F',
    };
    limitMsg.textContent = msgs[tier];
  }

  // Show/hide upgrade button based on tier
  const upgradeBtn = document.getElementById('upgradeBtnDesktop');
  if (upgradeBtn) upgradeBtn.style.display = tier === TIER.EXECUTIVE ? 'none' : '';

  // Market tab visibility
  const marketTab = document.getElementById('marketTab');
  if (marketTab) {
    marketTab.style.opacity = rank >= TIER_RANK[TIER.PRO] ? '1' : '0.45';
  }
}


const USE_REAL_AI    = false;
const OPENAI_API_KEY = '';
const OPENAI_MODEL   = 'gpt-4o-mini';

/* ══════════════════════════════════════════════════════════════════
   TRANSLATIONS  (all UI strings incl. PRO modal & waitlist)
   ══════════════════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  en: {
    /* ── Nav ── */
    btn_upgrade:'Upgrade to PRO', btn_pdf:'PDF',
    btn_save:'Save Dish', btn_reset:'New Recipe', btn_add_ing:'Add Ingredient', btn_load:'Load',
    /* ── Dish info ── */
    label_dish_info:'Dish Information', label_dish_name:'Dish Name', label_category:'Category',
    label_output:'Yield (g/ml)', label_servings:'Servings', label_multiplier:'Markup ×',
    label_markup:'Markup & Pricing', label_pf:'Sub-recipe',
    /* ── Ingredients ── */
    label_ingredients:'Ingredients', label_total_cost:'Total Prime Cost',
    th_name:'Ingredient', th_amount:'Amount', th_unit:'Unit',
    th_price_per_kg:'Price/kg·L', th_waste:'Waste %', th_supplier:'Supplier', th_cost:'Cost',
    price_sync_title:'Global Price Update',
    price_sync_msg:(name)=>`Update price for <strong>${name}</strong> in all saved recipes?`,
    price_sync_old:'Old:', price_sync_new:'New:',
    price_sync_yes:'Yes, update all', price_sync_no:'This recipe only',
    price_sync_done:(name,count)=>`✅ "${name}" updated in ${count} recipe(s).`,
    price_updated_label:'Updated:',
    ph_supplier:'Supplier',
    ph_dish:'e.g. Truffle Risotto', ph_name:'Search ingredient…',
    ph_amount:'e.g. 200', ph_price:'e.g. 45.00', ph_waste:'e.g. 5',
    /* ── Markup ── */
    hint_markup_low:'×1.5–2 = low', hint_markup_mid:'×3 = standard', hint_markup_high:'×4+ = premium',
    /* ── Categories ── */
    cat_starter:'Starter', cat_main:'Main', cat_dessert:'Dessert', cat_drink:'Drink', cat_other:'Other',
    /* ── Units ── */
    unit_g:'g', unit_kg:'kg', unit_ml:'ml', unit_l:'L',
    /* ── Results ── */
    label_results:'Live Results', label_margin_health:'Margin health',
    res_prime_cost:'Prime Cost', res_prime_sub:'Net cost',
    res_per100:'Per 100g', res_per100_sub:'Cost density',
    res_menu_price:'Menu Price', res_menu_sub:'Prime × markup',
    res_margin:'Margin', res_margin_sub:'Target >65%',
    /* ── Saved ── */
    label_saved:'Saved Recipes', msg_no_saved:'No saved recipes yet.',
    msg_saved_ok:'Recipe saved!', msg_deleted:'Recipe deleted.',
    msg_loaded:'Recipe loaded.', msg_reset:'Calculator reset.',
    msg_no_ing:'Add at least one ingredient before saving.',
    fc_label:'Food cost:', print_tagline:'Technical Recipe Card',
    /* ── Tabs ── */
    tab_calculator:'Calculator',
    tab_pf_library:'P/F Library',
    pf_library_title:'P/F Library',
    pf_library_subtitle:'All your semi-finished products with live cost-per-kg',
    btn_new_pf:'New P/F',
    btn_edit_pf:'Edit',
    pf_cost_per_kg:'Cost/kg',
    pf_used_in:'Used in',
    pf_recipes:'recipes',
    pf_stat_count:'Total P/F',
    pf_stat_avg_cost:'Avg Cost/kg',
    pf_stat_used_in:'Used in Recipes',
    pf_search_ph:'Search P/F products…',
    pf_empty_title:'No P/F products yet',
    pf_empty_desc:'Create a recipe, toggle the P/F switch, and save it.\nIt will appear here with its live cost-per-kg.',
    pf_saved_ok:'P/F saved!',
    toast_pf_create:'⭐ P/F mode active — fill in your sub-recipe',
    toast_pf_edit:'✏️ Editing P/F — save when done',
    tab_market:'Market / Прайс',
    tab_pro_badge:'PRO',
    /* ── Market ── */
    market_title:'Market / Price List',
    market_subtitle:'Edit prices — changes sync to all saved recipes',
    market_search_ph:'Search ingredient…',
    market_updated:'Last Updated',
    market_save_all:'Save All Changes',
    market_gate_title:'PRO Feature',
    market_gate_desc:'The Market tab requires the Pro plan or above.',
    /* ── Auth ── */
    auth_login:'Sign In',
    auth_sign_in:'Send Magic Link',
    auth_sign_out:'Sign Out',
    auth_signed_out:'Signed out.',
    auth_modal_title:'Sign in to Dishlytics',
    auth_modal_sub:'Save your recipes to the cloud and sync across devices.',
    auth_email_label:'Email',
    auth_email_ph:'your@email.com',
    auth_magic_note:"We'll send a magic link — no password needed.",
    auth_supabase_note:'Auth powered by Supabase (TODO: connect endpoint)',
    auth_signed_in_as:'Signed in as',
    auth_current_tier:'Current plan',
    auth_recipes_used:'Recipes saved',
    /* ── Margin msgs ── */
    msg_margin_idle:'Add ingredients to see margin health',
    msg_margin_great:'✓ Excellent margin — well above target',
    msg_margin_good:'✓ Healthy margin',
    msg_margin_thin:'⚠ Thin margin — consider repricing',
    msg_margin_low:'✕ Below target — reduce cost or raise price',
    /* ── Tier card ── */
    label_pf_section:'Semi-finished Products (P/F)',
    label_final_section:'Final Dishes',
    price_sync_pf_info:(pfCount,cascadeCount)=>`Also recalculates ${pfCount} P/F sub-recipe(s) used in ${cascadeCount} dish(es).`,
    tier_current_label:'Current plan', tier_limit_msg:'5 recipes saved · Basic AI',
    tier_free_badge:'Commis', tier_free_name:'Free', tier_free_role:'Commis',
    tier_pro_name:'Pro', tier_pro_role:'Sous-Chef',
    tier_exec_name:'Exec', tier_exec_role:'Chef de Cuisine',
    tier_per_mo:'/mo', tier_popular:'Most Popular',
    tier_free_f1:'5 saved recipes', tier_free_f2:'Basic calculator',
    tier_free_f3:'Mock AI assistant', tier_free_f4:'PDF export', tier_free_f5:'Cloud sync',
    tier_pro_f1:'♾️ Unlimited recipes', tier_pro_f2:'🤖 Advanced AI consultations',
    tier_pro_f3:'📄 PDF with custom logo', tier_pro_f4:'☁️ Cloud sync & backups',
    tier_pro_f5:'Sub-recipe linking',
    tier_exec_f1:'Everything in Pro', tier_exec_f2:'🧠 AI sub-recipe calculator',
    tier_exec_f3:'🔗 Multi-dish cost linking', tier_exec_f4:'Team collaboration',
    tier_exec_f5:'POS integration + API',
    /* ── PRO modal ── */
    pro_modal_title:'Unlock Dishlytics PRO',
    pro_modal_sub:'Professional tools for professional kitchens.',
    /* ── Waitlist ── */
    waitlist_title:'Launching PRO soon!',
    waitlist_desc:'Enter your email to get a 50% early-bird discount when we go live.',
    waitlist_ph:'your@email.com',
    waitlist_btn:'Join Waitlist',
    waitlist_success:"You're on the list! ⚡",
    waitlist_success_sub:"We'll notify you first when PRO launches.",
    waitlist_already:"You're already on the list! ⚡",
    /* ── AI chat ── */
    ai_header_sub:'Smart kitchen assistant',
    ai_quick_label:'Quick Actions',
    qa_margin75:'75% Margin', qa_waste:'Waste Guide', qa_subs:'Cheap Subs',
    qa_analyze:'Analyze Dish', qa_menutext:'✍️ Menu Text',
    ai_ph:'Ask about your recipe…',
    ai_disclaimer:'Mock AI — real API integration ready',
    /* ── Voice input ── */
    voice_listening:       'Listening…',
    voice_tap_to_speak:    'Tap to speak',
    voice_start:           'Start voice input',
    voice_stop:            'Stop listening',
    voice_not_supported:   'Voice input is not supported in this browser. Try Chrome or Edge.',
    voice_error_no_mic:    '🎤 Microphone access denied. Please allow mic permissions.',
    voice_error_network:   '🌐 Network error — voice recognition requires an internet connection.',
    voice_error_generic:   '⚠ Voice input error. Please try again.',
    ai_welcome:'👋 Hi! I\'m Chef AI. Ask about costs, waste %, swaps, pricing, or hit "Menu Text" to generate a restaurant description for your dish.',
    ai_thinking:'Analysing your recipe…',
    ai_margin75_no_cost:'Add some ingredients first so I can calculate the 75% margin price.',
    ai_margin75_result:(c,p,s)=>`To achieve **75% gross margin**, your menu price should be:\n\n**${s}${p}**\n\nFormula: Prime Cost ÷ 0.25 = ${s}${c} ÷ 0.25\n\nMarkup updated.`,
    ai_analyze_empty:'Add some ingredients first so I can analyse this dish.',
    ai_analyze:(c,p,m,cat,s)=>{
      const lv=m>=70?'🟢 Excellent':m>=55?'🟡 Good':m>=40?'🟠 Thin':'🔴 Too low';
      const advice={starter:`For a starter, prime cost of ${s}${c} is ${parseFloat(c)>5?'on the high side':'looking good'}.`,main:`Main course at ${s}${c} is ${parseFloat(c)>15?'high — review proteins':'reasonable'}.`,dessert:`Dessert at ${s}${c} is ${parseFloat(c)>4?'a bit high':'solid'}.`,drink:`Drink at ${s}${c} is ${parseFloat(c)>3?'high for high-volume':'acceptable'}.`,other:'Cost looks reasonable.'};
      return `📊 **Dish Analysis**\n\nPrime cost: ${s}${c}\nSuggested price: ${s}${p}\nMargin: ${m.toFixed(1)}% — ${lv}\n\n${advice[cat]||advice.other}`;
    },
    ai_menutext_empty:'Add some ingredients first so I can write a menu description.',
    ai_menutext:(dish,ings,cat,price,s)=>{
      const name=dish||'This dish';
      const highlight=ings.slice(0,3).map(i=>i.toLowerCase()).join(', ');
      const templates=[
        `**${name}** — A refined ${cat} showcasing ${highlight}. Carefully prepared with attention to balance and texture, this dish delivers a memorable experience at every bite. Priced at ${s}${price}.`,
        `**${name}** — An elegant creation featuring ${highlight}. The interplay of flavours and textures makes this ${cat} a highlight of our menu. ${s}${price}.`,
        `**${name}** — Crafted with ${highlight}, this ${cat} brings together seasonal produce and precise technique. A chef's signature at ${s}${price}.`,
      ];
      return templates[Math.floor(Math.random()*templates.length)];
    },
    ai_waste_data:{
      salmon:{pct:45,tip:'Whole salmon: head, bones, skin and trim — ~45% loss. Pre-filleted portions reduce to 15%.'},
      trout:{pct:40,tip:'Whole trout loses ~40%. Pre-filleted reduces to ~12%.'},
      tuna:{pct:30,tip:'Tuna block: ~30% loss from skin and sinew removal.'},
      shrimp:{pct:35,tip:'Raw shell-on shrimp: ~35% after peeling and deveining.'},
      chicken:{pct:25,tip:'Whole chicken: ~25% bone and skin. Boneless thighs ~10%.'},
      beef:{pct:20,tip:'Beef trim: ~20% fat and connective tissue.'},
      potato:{pct:20,tip:'Peeling: ~20% loss. Y-peeler minimises waste.'},
      onion:{pct:12,tip:'Skin and root removal: ~12%.'},
      carrot:{pct:15,tip:'Peeling and top removal: ~15%.'},
      'sea bass':{pct:45,tip:'Whole sea bass: ~45% loss. Head, bones, skin.'},
      octopus:{pct:60,tip:'Raw octopus shrinks ~60% during boiling. Always buy by raw weight.'},
      squid:{pct:35,tip:'Squid cleaning and boiling shrinkage: ~35% combined loss.'},
    },
    ai_waste_unknown:i=>`No waste data for "${i}" yet. Fish fillets 15–20%, whole fish 40–50%, root veg 15–25%.`,
    ai_waste_intro:(i,p,tip)=>`🗑 **Waste for ${i}: ~${p}%**\n\n${tip}\n\nShall I apply ${p}% to the "${i}" row?`,
    ai_waste_applied:(i,p)=>`✅ Applied **${p}%** waste to "${i}". Costs recalculated.`,
    ai_waste_not_found:i=>`Couldn't find "${i}" in your table. Check the ingredient name.`,
    ai_subs_data:{
      parmesan:['Grana Padano (~30% cheaper)','Pecorino Romano','Aged Manchego'],
      'pine nuts':['Sunflower seeds (~70% cheaper)','Toasted pumpkin seeds','Crushed walnuts'],
      truffle:['Truffle oil (use sparingly)','Dried porcini','Black olive tapenade'],
      saffron:['Turmeric (colour only)','Marigold petals','Smoked paprika'],
      'sea bass':['Tilapia (~40% cheaper)','Pangasius / Basa','Pollock'],
      salmon:['Rainbow trout (~40% cheaper)','Mackerel','Canned salmon for sauces'],
      octopus:['Squid (cheaper, similar texture)','Cuttlefish','Calamari rings'],
      cream:['Coconut cream','Evaporated milk','Greek yoghurt'],
      butter:['Clarified butter','Coconut oil','Quality margarine'],
    },
    ai_subs_unknown:i=>`No swaps for "${i}" yet. Look for local/seasonal alternatives.`,
    ai_subs_intro:(i,subs)=>`💡 **Cheaper alternatives for ${i}:**\n\n${subs.map(s=>'• '+s).join('\n')}`,
    ai_custom_fallback:'Great question! Set USE_REAL_AI = true and add your OpenAI key to get personalised responses.',
  },

  ru: {
    btn_upgrade:'Перейти на PRO', btn_pdf:'PDF',
    btn_save:'Сохранить', btn_reset:'Новый рецепт', btn_add_ing:'Добавить ингредиент', btn_load:'Загрузить',
    label_dish_info:'Информация о блюде', label_dish_name:'Название блюда', label_category:'Категория',
    label_output:'Выход (г/мл)', label_servings:'Порций', label_multiplier:'Наценка ×',
    label_markup:'Наценка и ценообразование', label_pf:'Полуфабрикат',
    label_ingredients:'Ингредиенты', label_total_cost:'Общая себестоимость',
    th_name:'Ингредиент', th_amount:'Кол-во', th_unit:'Ед.',
    th_price_per_kg:'Цена/кг·л', th_waste:'% отхода', th_supplier:'Поставщик', th_cost:'Стоимость',
    price_sync_title:'Глобальное обновление цены',
    price_sync_msg:(name)=>`Обновить цену для <strong>${name}</strong> во всех рецептах?`,
    price_sync_old:'Было:', price_sync_new:'Стало:',
    price_sync_yes:'Да, обновить везде', price_sync_no:'Только этот рецепт',
    price_sync_done:(name,count)=>`✅ "${name}" обновлено в ${count} рецепт(ах).`,
    price_updated_label:'Обновлено:',
    ph_supplier:'Поставщик',
    ph_dish:'напр. Трюфельное ризотто', ph_name:'Поиск ингредиента…',
    ph_amount:'напр. 200', ph_price:'напр. 45.00', ph_waste:'напр. 5',
    hint_markup_low:'×1.5–2 = низкая', hint_markup_mid:'×3 = стандарт', hint_markup_high:'×4+ = премиум',
    cat_starter:'Закуски', cat_main:'Основные', cat_dessert:'Десерты', cat_drink:'Напитки', cat_other:'Прочее',
    unit_g:'г', unit_kg:'кг', unit_ml:'мл', unit_l:'Л',
    label_results:'Результаты', label_margin_health:'Состояние маржи',
    res_prime_cost:'Себестоимость', res_prime_sub:'Чистые затраты',
    res_per100:'За 100г', res_per100_sub:'Плотность затрат',
    res_menu_price:'Цена в меню', res_menu_sub:'Себест. × наценка',
    res_margin:'Маржа', res_margin_sub:'Цель >65%',
    label_saved:'Сохранённые рецепты', msg_no_saved:'Нет сохранённых рецептов.',
    msg_saved_ok:'Рецепт сохранён!', msg_deleted:'Рецепт удалён.',
    msg_loaded:'Рецепт загружен.', msg_reset:'Калькулятор сброшен.',
    msg_no_ing:'Добавьте хотя бы один ингредиент.',
    fc_label:'Доля продуктов:', print_tagline:'Технологическая карта',
    tab_calculator:'Калькулятор',
    tab_pf_library:'Бібліотека П/Ф',
    pf_library_title:'Бібліотека П/Ф',
    pf_library_subtitle:'Усі ваші напівфабрикати з актуальною собівартістю за кг',
    btn_new_pf:'Новий П/Ф',
    btn_edit_pf:'Редагувати',
    pf_cost_per_kg:'Собівартість/кг',
    pf_used_in:'Використовується в',
    pf_recipes:'рецепт(ах)',
    pf_stat_count:'Всього П/Ф',
    pf_stat_avg_cost:'Середня вартість/кг',
    pf_stat_used_in:'Використовується в рецептах',
    pf_search_ph:'Пошук П/Ф…',
    pf_empty_title:'Немає напівфабрикатів',
    pf_empty_desc:'Створіть рецепт, увімкніть перемикач П/Ф і збережіть.',
    pf_saved_ok:'П/Ф збережено!',
    toast_pf_create:'⭐ Режим П/Ф активний — заповніть рецепт напівфабрикату',
    toast_pf_edit:'✏️ Редагування П/Ф — збережіть після змін',
    tab_pf_library:'Библиотека П/Ф',
    pf_library_title:'Библиотека П/Ф',
    pf_library_subtitle:'Все ваши полуфабрикаты с актуальной себестоимостью за кг',
    btn_new_pf:'Новый П/Ф',
    btn_edit_pf:'Редактировать',
    pf_cost_per_kg:'Себест./кг',
    pf_used_in:'Используется в',
    pf_recipes:'рецепт(ах)',
    pf_stat_count:'Всего П/Ф',
    pf_stat_avg_cost:'Средняя стоимость/кг',
    pf_stat_used_in:'Используется в рецептах',
    pf_search_ph:'Поиск П/Ф…',
    pf_empty_title:'Нет полуфабрикатов',
    pf_empty_desc:'Создайте рецепт, включите переключатель П/Ф и сохраните.',
    pf_saved_ok:'П/Ф сохранён!',
    toast_pf_create:'⭐ Режим П/Ф активен — заполните рецепт полуфабриката',
    toast_pf_edit:'✏️ Редактирование П/Ф — сохраните после изменений',
    tab_market:'Маркет / Прайс',
    tab_pro_badge:'PRO',
    market_title:'Маркет / Прайс-лист',
    market_subtitle:'Изменяйте цены — автоматически обновятся все рецепты',
    market_search_ph:'Поиск ингредиента…',
    market_updated:'Обновлено',
    market_save_all:'Сохранить все',
    market_gate_title:'Функция PRO',
    market_gate_desc:'Вкладка Маркет доступна в тарифе Pro и выше.',
    auth_login:'Войти',
    auth_sign_in:'Отправить Magic Link',
    auth_sign_out:'Выйти',
    auth_signed_out:'Вы вышли из системы.',
    auth_modal_title:'Войти в Dishlytics',
    auth_modal_sub:'Сохраняйте рецепты в облако и синхронизируйте между устройствами.',
    auth_email_label:'Email',
    auth_email_ph:'ваш@email.com',
    auth_magic_note:'Мы пришлём magic-ссылку — пароль не нужен.',
    auth_supabase_note:'Авторизация через Supabase (TODO: подключить endpoint)',
    auth_signed_in_as:'Вы вошли как',
    auth_current_tier:'Текущий тариф',
    auth_recipes_used:'Рецептов сохранено',
    msg_margin_idle:'Добавьте ингредиенты для расчёта маржи',
    msg_margin_great:'✓ Отличная маржа — выше цели',
    msg_margin_good:'✓ Хорошая маржа',
    msg_margin_thin:'⚠ Низкая маржа — рассмотрите повышение цены',
    msg_margin_low:'✕ Ниже цели — снизьте затраты или поднимите цену',
    label_pf_section:'Полуфабрикаты (П/Ф)',
    label_final_section:'Готовые блюда',
    price_sync_pf_info:(pfCount,cascadeCount)=>`Также пересчитает ${pfCount} П/Ф, используемых в ${cascadeCount} блюд(е).`,
    tier_current_label:'Текущий план', tier_limit_msg:'5 рецептов · Базовый AI',
    tier_free_badge:'Кок', tier_free_name:'Бесплатно', tier_free_role:'Комми',
    tier_pro_name:'Про', tier_pro_role:'Су-шеф',
    tier_exec_name:'Экзек.', tier_exec_role:'Шеф-повар',
    tier_per_mo:'/мес', tier_popular:'Популярный',
    tier_free_f1:'5 рецептов', tier_free_f2:'Базовый калькулятор',
    tier_free_f3:'Mock AI', tier_free_f4:'Экспорт PDF', tier_free_f5:'Облако',
    tier_pro_f1:'♾️ Неограниченные рецепты', tier_pro_f2:'🤖 Расширенный AI',
    tier_pro_f3:'📄 PDF с логотипом', tier_pro_f4:'☁️ Облачная синхронизация',
    tier_pro_f5:'Связка полуфабрикатов',
    tier_exec_f1:'Всё из Pro', tier_exec_f2:'🧠 AI-расчёт полуфабрикатов',
    tier_exec_f3:'🔗 Связка нескольких блюд', tier_exec_f4:'Командная работа',
    tier_exec_f5:'Интеграция POS + API',
    pro_modal_title:'Открыть Dishlytics PRO',
    pro_modal_sub:'Профессиональные инструменты для профессиональных кухонь.',
    waitlist_title:'PRO скоро запускается!',
    waitlist_desc:'Введите email и получите скидку 50% при запуске.',
    waitlist_ph:'ваш@email.com',
    waitlist_btn:'Присоединиться к листу ожидания',
    waitlist_success:'Вы в списке! ⚡',
    waitlist_success_sub:'Мы уведомим вас первыми при запуске PRO.',
    waitlist_already:'Вы уже в списке! ⚡',
    ai_header_sub:'Умный кухонный ассистент',
    ai_quick_label:'Быстрые действия',
    qa_margin75:'Маржа 75%', qa_waste:'Справка отходов', qa_subs:'Дешёвые замены',
    qa_analyze:'Анализ блюда', qa_menutext:'✍️ Текст меню',
    ai_ph:'Задайте вопрос о рецепте…',
    ai_disclaimer:'Mock AI — интеграция реального API готова',
    /* ── Voice input ── */
    voice_listening:       'Слушаю…',
    voice_tap_to_speak:    'Нажмите, чтобы говорить',
    voice_start:           'Голосовой ввод',
    voice_stop:            'Остановить запись',
    voice_not_supported:   'Голосовой ввод не поддерживается в этом браузере. Попробуйте Chrome или Edge.',
    voice_error_no_mic:    '🎤 Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.',
    voice_error_network:   '🌐 Ошибка сети — голосовое распознавание требует интернета.',
    voice_error_generic:   '⚠ Ошибка голосового ввода. Попробуйте снова.',
    ai_welcome:'👋 Привет! Я Chef AI. Спросите о затратах, отходах, заменах или нажмите «Текст меню» для генерации описания.',
    ai_thinking:'Анализируем рецепт…',
    ai_margin75_no_cost:'Сначала добавьте ингредиенты.',
    ai_margin75_result:(c,p,s)=>`Для **75% маржи** цена в меню: **${s}${p}**\n\nФормула: ${s}${c} ÷ 0.25 = ${s}${p}\n\nНаценка обновлена.`,
    ai_analyze_empty:'Сначала добавьте ингредиенты.',
    ai_analyze:(c,p,m,cat,s)=>{
      const lv=m>=70?'🟢 Отлично':m>=55?'🟡 Хорошо':m>=40?'🟠 Низко':'🔴 Плохо';
      const advice={starter:`Для закуски ${s}${c} ${parseFloat(c)>5?'высоко':'норма'}.`,main:`Основное ${s}${c} — ${parseFloat(c)>15?'высоко':'разумно'}.`,dessert:`Десерт ${s}${c} — ${parseFloat(c)>4?'высоко':'норма'}.`,drink:`Напиток ${s}${c} — ${parseFloat(c)>3?'высоко':'приемлемо'}.`,other:'Себестоимость разумная.'};
      return `📊 **Анализ блюда**\n\nСебестоимость: ${s}${c}\nРекомендуемая цена: ${s}${p}\nМаржа: ${m.toFixed(1)}% — ${lv}\n\n${advice[cat]||advice.other}`;
    },
    ai_menutext_empty:'Сначала добавьте ингредиенты.',
    ai_menutext:(dish,ings,cat,price,s)=>{
      const name=dish||'Блюдо';
      const hl=ings.slice(0,3).join(', ');
      return `**${name}** — Изысканное блюдо категории «${cat}» с ${hl}. Тщательно приготовленное с вниманием к балансу и текстуре. Цена: ${s}${price}.`;
    },
    ai_waste_data:{
      salmon:{pct:45,tip:'Целый лосось: голова, кости, кожа — ~45% потерь. Готовое филе — 15%.'},
      trout:{pct:40,tip:'Целая форель: ~40%. Готовое филе ~12%.'},
      tuna:{pct:30,tip:'Тунец: ~30% при удалении кожи и жилок.'},
      shrimp:{pct:35,tip:'Неочищенные креветки: ~35%.'},
      chicken:{pct:25,tip:'Целая курица: ~25%. Филе бедра ~10%.'},
      beef:{pct:20,tip:'Говядина: ~20% жир и соединительная ткань.'},
      potato:{pct:20,tip:'Очистка: ~20% потерь.'},
      onion:{pct:12,tip:'Кожура и корень: ~12%.'},
      carrot:{pct:15,tip:'Очистка и ботва: ~15%.'},
      'sea bass':{pct:45,tip:'Целый окунь: ~45%.'},
      octopus:{pct:60,tip:'Осьминог уваривается на ~60%. Закупайте по сырому весу.'},
      squid:{pct:35,tip:'Кальмар: ~35% при чистке и варке.'},
    },
    ai_waste_unknown:i=>`Нет данных для "${i}". Рыбное филе 15–20%, целая рыба 40–50%, корнеплоды 15–25%.`,
    ai_waste_intro:(i,p,tip)=>`🗑 **Отходы для ${i}: ~${p}%**\n\n${tip}\n\nПрименить ${p}% к строке "${i}"?`,
    ai_waste_applied:(i,p)=>`✅ Применено **${p}%** к "${i}". Затраты пересчитаны.`,
    ai_waste_not_found:i=>`Не найден "${i}" в таблице. Проверьте название.`,
    ai_subs_data:{
      parmesan:['Грана Падано (~30% дешевле)','Пекорино Романо','Манчего'],
      'pine nuts':['Семечки подсолнуха (~70% дешевле)','Тыквенные семечки','Грецкие орехи'],
      truffle:['Трюфельное масло','Сухие белые грибы','Паста из оливок'],
      saffron:['Куркума','Лепестки календулы','Копчёная паприка'],
      'sea bass':['Тиляпия','Пангасиус','Минтай'],
      salmon:['Форель (~40% дешевле)','Скумбрия','Консервы'],
      octopus:['Кальмар (дешевле, схожая текстура)','Каракатица','Кольца кальмара'],
      cream:['Кокосовые сливки','Сгущённое молоко','Греческий йогурт'],
      butter:['Топлёное масло','Кокосовое масло','Маргарин'],
    },
    ai_subs_unknown:i=>`Нет замен для "${i}". Ищите местные аналоги.`,
    ai_subs_intro:(i,subs)=>`💡 **Замены для ${i}:**\n\n${subs.map(s=>'• '+s).join('\n')}`,
    ai_custom_fallback:'Отличный вопрос! Задайте USE_REAL_AI = true и добавьте ключ OpenAI.',
  },

  ua: {
    btn_upgrade:'Перейти на PRO', btn_pdf:'PDF',
    btn_save:'Зберегти', btn_reset:'Новий рецепт', btn_add_ing:'Додати інгредієнт', btn_load:'Завантажити',
    label_dish_info:'Інформація про страву', label_dish_name:'Назва страви', label_category:'Категорія',
    label_output:'Вихід (г/мл)', label_servings:'Порцій', label_multiplier:'Націнка ×',
    label_markup:'Націнка та ціноутворення', label_pf:'Напівфабрикат',
    label_ingredients:'Інгредієнти', label_total_cost:'Загальна собівартість',
    th_name:'Інгредієнт', th_amount:'Кіл-ть', th_unit:'Од.',
    th_price_per_kg:'Ціна/кг·л', th_waste:'% відходу', th_supplier:'Постачальник', th_cost:'Вартість',
    price_sync_title:'Глобальне оновлення ціни',
    price_sync_msg:(name)=>`Оновити ціну для <strong>${name}</strong> у всіх рецептах?`,
    price_sync_old:'Було:', price_sync_new:'Стало:',
    price_sync_yes:'Так, оновити скрізь', price_sync_no:'Лише цей рецепт',
    price_sync_done:(name,count)=>`✅ "${name}" оновлено у ${count} рецепт(ах).`,
    price_updated_label:'Оновлено:',
    ph_supplier:'Постачальник',
    ph_dish:'напр. Трюфельне різото', ph_name:'Пошук інгредієнта…',
    ph_amount:'напр. 200', ph_price:'напр. 45.00', ph_waste:'напр. 5',
    hint_markup_low:'×1.5–2 = низька', hint_markup_mid:'×3 = стандарт', hint_markup_high:'×4+ = преміум',
    cat_starter:'Закуски', cat_main:'Основні', cat_dessert:'Десерти', cat_drink:'Напої', cat_other:'Інше',
    unit_g:'г', unit_kg:'кг', unit_ml:'мл', unit_l:'Л',
    label_results:'Результати', label_margin_health:'Стан маржі',
    res_prime_cost:'Собівартість', res_prime_sub:'Чисті витрати',
    res_per100:'На 100г', res_per100_sub:'Щільність витрат',
    res_menu_price:'Ціна в меню', res_menu_sub:'Собів. × націнка',
    res_margin:'Маржа', res_margin_sub:'Ціль >65%',
    label_saved:'Збережені рецепти', msg_no_saved:'Немає збережених рецептів.',
    msg_saved_ok:'Рецепт збережено!', msg_deleted:'Рецепт видалено.',
    msg_loaded:'Рецепт завантажено.', msg_reset:'Калькулятор скинуто.',
    msg_no_ing:'Додайте хоча б один інгредієнт.',
    fc_label:'Частка продуктів:', print_tagline:'Технологічна картка',
    tab_calculator:'Калькулятор',
    tab_market:'Маркет / Прайс',
    tab_pro_badge:'PRO',
    market_title:'Маркет / Прайс-лист',
    market_subtitle:'Змінюйте ціни — автоматично оновляться всі рецепти',
    market_search_ph:'Пошук інгредієнта…',
    market_updated:'Оновлено',
    market_save_all:'Зберегти все',
    market_gate_title:'Функція PRO',
    market_gate_desc:'Вкладка Маркет доступна у тарифі Pro та вище.',
    auth_login:'Увійти',
    auth_sign_in:'Надіслати Magic Link',
    auth_sign_out:'Вийти',
    auth_signed_out:'Ви вийшли з системи.',
    auth_modal_title:'Увійти в Dishlytics',
    auth_modal_sub:'Зберігайте рецепти в хмару та синхронізуйте між пристроями.',
    auth_email_label:'Email',
    auth_email_ph:'ваш@email.com',
    auth_magic_note:'Ми надішлемо magic-посилання — пароль не потрібен.',
    auth_supabase_note:'Авторизація через Supabase (TODO: підключити endpoint)',
    auth_signed_in_as:'Ви увійшли як',
    auth_current_tier:'Поточний тариф',
    auth_recipes_used:'Рецептів збережено',
    msg_margin_idle:'Додайте інгредієнти для розрахунку маржі',
    msg_margin_great:'✓ Чудова маржа — вище цілі',
    msg_margin_good:'✓ Хороша маржа',
    msg_margin_thin:'⚠ Низька маржа — розгляньте підвищення ціни',
    msg_margin_low:'✕ Нижче цілі — знизьте витрати або підніміть ціну',
    label_pf_section:'Напівфабрикати (П/Ф)',
    label_final_section:'Готові страви',
    price_sync_pf_info:(pfCount,cascadeCount)=>`Також перерахує ${pfCount} П/Ф, що використовуються в ${cascadeCount} страв(і).`,
    tier_current_label:'Поточний план', tier_limit_msg:'5 рецептів · Базовий AI',
    tier_free_badge:'Комі', tier_free_name:'Безкоштовно', tier_free_role:'Комі',
    tier_pro_name:'Про', tier_pro_role:'Су-шеф',
    tier_exec_name:'Екзек.', tier_exec_role:'Шеф-кухар',
    tier_per_mo:'/міс', tier_popular:'Популярний',
    tier_free_f1:'5 рецептів', tier_free_f2:'Базовий калькулятор',
    tier_free_f3:'Mock AI', tier_free_f4:'Експорт PDF', tier_free_f5:'Хмара',
    tier_pro_f1:'♾️ Необмежені рецепти', tier_pro_f2:'🤖 Розширений AI',
    tier_pro_f3:'📄 PDF з логотипом', tier_pro_f4:'☁️ Хмарна синхронізація',
    tier_pro_f5:'Зв\'язка напівфабрикатів',
    tier_exec_f1:'Все з Pro', tier_exec_f2:'🧠 AI-розрахунок напівфабрикатів',
    tier_exec_f3:'🔗 Зв\'язка кількох страв', tier_exec_f4:'Командна робота',
    tier_exec_f5:'Інтеграція POS + API',
    pro_modal_title:'Відкрити Dishlytics PRO',
    pro_modal_sub:'Профессійні інструменти для профессійних кухонь.',
    waitlist_title:'PRO скоро запускається!',
    waitlist_desc:'Введіть email та отримайте знижку 50% при запуску.',
    waitlist_ph:'ваш@email.com',
    waitlist_btn:'Приєднатись до листа очікування',
    waitlist_success:'Ви в списку! ⚡',
    waitlist_success_sub:'Ми сповістимо вас першими при запуску PRO.',
    waitlist_already:'Ви вже в списку! ⚡',
    ai_header_sub:'Розумний кухонний асистент',
    ai_quick_label:'Швидкі дії',
    qa_margin75:'Маржа 75%', qa_waste:'Довідник відходів', qa_subs:'Дешеві замінники',
    qa_analyze:'Аналіз страви', qa_menutext:'✍️ Текст меню',
    ai_ph:'Запитайте про рецепт…',
    ai_disclaimer:'Mock AI — інтеграція реального API готова',
    /* ── Voice input ── */
    voice_listening:       'Слухаю…',
    voice_tap_to_speak:    'Натисніть, щоб говорити',
    voice_start:           'Голосове введення',
    voice_stop:            'Зупинити запис',
    voice_not_supported:   'Голосове введення не підтримується в цьому браузері. Спробуйте Chrome або Edge.',
    voice_error_no_mic:    '🎤 Доступ до мікрофона заборонено. Дозвольте доступ у налаштуваннях браузера.',
    voice_error_network:   '🌐 Помилка мережі — розпізнавання голосу потребує інтернету.',
    voice_error_generic:   '⚠ Помилка голосового введення. Спробуйте ще раз.',
    ai_welcome:'👋 Привіт! Я Chef AI. Запитайте про витрати, відходи, замінники або натисніть «Текст меню» для опису страви.',
    ai_thinking:'Аналізуємо рецепт…',
    ai_margin75_no_cost:'Спочатку додайте інгредієнти.',
    ai_margin75_result:(c,p,s)=>`Для **75% маржі** ціна в меню: **${s}${p}**\n\nФормула: ${s}${c} ÷ 0.25 = ${s}${p}\n\nНаціnку оновлено.`,
    ai_analyze_empty:'Спочатку додайте інгредієнти.',
    ai_analyze:(c,p,m,cat,s)=>{
      const lv=m>=70?'🟢 Відмінно':m>=55?'🟡 Добре':m>=40?'🟠 Низько':'🔴 Погано';
      const advice={starter:`Для закуски ${s}${c} ${parseFloat(c)>5?'висока':'нормальна'}.`,main:`Основна ${s}${c} — ${parseFloat(c)>15?'висока':'розумна'}.`,dessert:`Десерт ${s}${c} — ${parseFloat(c)>4?'висока':'нормальна'}.`,drink:`Напій ${s}${c} — ${parseFloat(c)>3?'висока':'прийнятна'}.`,other:'Собівартість розумна.'};
      return `📊 **Аналіз страви**\n\nСобівартість: ${s}${c}\nРекомендована ціна: ${s}${p}\nМаржа: ${m.toFixed(1)}% — ${lv}\n\n${advice[cat]||advice.other}`;
    },
    ai_menutext_empty:'Спочатку додайте інгредієнти.',
    ai_menutext:(dish,ings,cat,price,s)=>{
      const name=dish||'Страва';
      const hl=ings.slice(0,3).join(', ');
      return `**${name}** — Вишукана страва категорії «${cat}» з ${hl}. Ретельно приготована з увагою до балансу та текстури. Ціна: ${s}${price}.`;
    },
    ai_waste_data:{
      salmon:{pct:45,tip:'Цілий лосось: голова, кістки, шкіра — ~45%. Готове філе 15%.'},
      trout:{pct:40,tip:'Ціла форель: ~40%. Готове філе ~12%.'},
      tuna:{pct:30,tip:'Тунець: ~30%.'},
      shrimp:{pct:35,tip:'Неочищені креветки: ~35%.'},
      chicken:{pct:25,tip:'Ціла курка: ~25%. Філе стегна ~10%.'},
      beef:{pct:20,tip:'Яловичина: ~20%.'},
      potato:{pct:20,tip:'Очищення: ~20%.'},
      onion:{pct:12,tip:'Шкірка і корінь: ~12%.'},
      carrot:{pct:15,tip:'Очищення і бадилля: ~15%.'},
      'sea bass':{pct:45,tip:'Цілий окунь: ~45%.'},
      octopus:{pct:60,tip:'Восьминіг уварюється на ~60%. Купуйте по сирій вазі.'},
      squid:{pct:35,tip:'Кальмар: ~35% при чистці та варінні.'},
    },
    ai_waste_unknown:i=>`Немає даних для "${i}". Рибне філе 15–20%, ціла риба 40–50%, коренеплоди 15–25%.`,
    ai_waste_intro:(i,p,tip)=>`🗑 **Відходи для ${i}: ~${p}%**\n\n${tip}\n\nЗастосувати ${p}% до рядка "${i}"?`,
    ai_waste_applied:(i,p)=>`✅ Застосовано **${p}%** до "${i}". Витрати перераховано.`,
    ai_waste_not_found:i=>`Не знайдено "${i}" в таблиці. Перевірте назву.`,
    ai_subs_data:{
      parmesan:['Грана Падано (~30% дешевше)','Пекоріно Романо','Манчего'],
      'pine nuts':['Насіння соняшнику (~70% дешевше)','Гарбузове насіння','Волоські горіхи'],
      truffle:['Трюфельна олія','Сухі білі гриби','Паста з оливок'],
      saffron:['Куркума','Пелюстки календули','Копчена паприка'],
      'sea bass':['Тілапія','Пангасіус','Мінтай'],
      salmon:['Форель (~40% дешевше)','Скумбрія','Консерви'],
      octopus:['Кальмар (дешевше, схожа текстура)','Каракатиця','Кільця кальмара'],
      cream:['Кокосові вершки','Згущене молоко','Грецький йогурт'],
      butter:['Топлене масло','Кокосова олія','Маргарин'],
    },
    ai_subs_unknown:i=>`Немає замінників для "${i}". Шукайте місцеві альтернативи.`,
    ai_subs_intro:(i,subs)=>`💡 **Замінники для ${i}:**\n\n${subs.map(s=>'• '+s).join('\n')}`,
    ai_custom_fallback:'Чудове питання! Задайте USE_REAL_AI = true і додайте ключ OpenAI.',
  },
};

/* ══════════════════════════════════════════════════════════════════
   CURRENCY & STATE
   ══════════════════════════════════════════════════════════════════ */
/* ── Currency map
   EN  → USD ($)
   RU  → UAH (₴)  ← stays UAH regardless of language selection
   UA  → UAH (₴)
   Currency is NEVER auto-switched when the user changes language between RU/UA.
   Prices stored in localStorage remain in UAH at all times.
── */
const CURRENCY_MAP={
  en:{symbol:'$',  code:'USD'},
  ru:{symbol:'₴',  code:'UAH'},   // RU interface, UAH prices
  ua:{symbol:'₴',  code:'UAH'},
};

/* Derive the display currency from the map without touching prices */
function getCurrency(){ return CURRENCY_MAP[currentLang] ?? CURRENCY_MAP.ua; }

let currentLang='en', currentMarkup=3, rowIdCounter=0, chatOpen=false, chatInitialised=false;

/* ── Helpers ── */
function t(k){return TRANSLATIONS[currentLang]?.[k]??TRANSLATIONS.en[k]??k}
function sym(){return getCurrency().symbol}
function fmt(v){return sym()+parseFloat(v).toFixed(2)}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

/* ══════════════════════════════════════════════════════════════════
   LANGUAGE SYSTEM
   ══════════════════════════════════════════════════════════════════ */
function setLang(lang){
  if(!TRANSLATIONS[lang])return;
  currentLang=lang;
  try{localStorage.setItem('dl_lang',lang)}catch(e){}
  document.documentElement.setAttribute('data-lang',lang);
  document.documentElement.lang=lang==='ua'?'uk':lang;
  const cur=getCurrency();
  const badge=document.getElementById('currencyBadge');
  if(badge)badge.textContent=cur.symbol+' '+cur.code;
  /* Only persist currency when switching TO English (USD).
     RU and UA both use UAH — no currency change needed, no overwrite. */
  if(lang==='en'){
    try{localStorage.setItem('dl_currency',JSON.stringify(cur))}catch(e){}
  } else {
    // Ensure any stale ₽ entry is cleared
    try{localStorage.setItem('dl_currency',JSON.stringify({symbol:'₴',code:'UAH'}))}catch(e){}
  }
  document.querySelectorAll('.lb').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  document.querySelectorAll('[data-i18n]').forEach(el=>{const v=t(el.getAttribute('data-i18n'));if(typeof v==='string')el.textContent=v});
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{const v=t(el.getAttribute('data-i18n-ph'));if(typeof v==='string')el.placeholder=v});
  document.querySelectorAll('[data-i18n-opt]').forEach(opt=>{const v=t(opt.getAttribute('data-i18n-opt'));if(typeof v==='string')opt.textContent=v});
  refreshRowTranslations();
  renderSaved();
  calculate();
  syncVoiceLang();
}

function refreshRowTranslations(){
  document.querySelectorAll('.ing-row-desktop,.ing-row-mobile').forEach(row=>{
    row.querySelectorAll('[data-i18n-ph]').forEach(el=>{const v=t(el.getAttribute('data-i18n-ph'));if(typeof v==='string')el.placeholder=v});
    row.querySelectorAll('[data-i18n]').forEach(el=>{const v=t(el.getAttribute('data-i18n'));if(typeof v==='string')el.textContent=v});
    row.querySelectorAll('.unit-sel').forEach(sel=>{
      const v=sel.value;
      if(sel.options[0])sel.options[0].text=t('unit_g');
      if(sel.options[1])sel.options[1].text=t('unit_kg');
      if(sel.options[2])sel.options[2].text=t('unit_ml');
      if(sel.options[3])sel.options[3].text=t('unit_l');
      sel.value=v;
    });
  });
}

/* ══════════════════════════════════════════════════════════════════
   PRO MODAL + WAITLIST
   ══════════════════════════════════════════════════════════════════ */
function openProModal(){
  const ov=document.getElementById('proModalOverlay');
  ov.classList.add('open');
  ov.setAttribute('aria-hidden','false');
  // Check if already on waitlist
  const email=getWaitlistEmail();
  if(email){showWaitlistSuccess(email,true);}
  // Trap focus
  setTimeout(()=>document.getElementById('waitlistEmail')?.focus(),200);
  document.body.style.overflow='hidden';
}

function closeProModal(){
  const ov=document.getElementById('proModalOverlay');
  ov.classList.remove('open');
  ov.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

function handleOverlayClick(e){
  if(e.target===document.getElementById('proModalOverlay'))closeProModal();
}

function joinWaitlist(){
  const input=document.getElementById('waitlistEmail');
  const email=(input?.value||'').trim();
  if(!email||!email.includes('@')){
    input?.focus();
    input?.classList.add('shake-input');
    setTimeout(()=>input?.classList.remove('shake-input'),500);
    return;
  }
  try{localStorage.setItem('dl_waitlist_email',email);}catch(e){}
  showWaitlistSuccess(email,false);
}

function showWaitlistSuccess(email,already){
  const form=document.getElementById('waitlistForm');
  const success=document.getElementById('waitlistSuccess');
  const sub=document.getElementById('waitlistSuccessSub');
  if(form)form.style.display='none';
  if(success)success.style.display='block';
  const msgEl=success?.querySelector('.success-msg');
  if(msgEl)msgEl.textContent=already?t('waitlist_already'):t('waitlist_success');
  if(sub)sub.textContent=t('waitlist_success_sub')+' ('+email+')';
}

function getWaitlistEmail(){
  try{return localStorage.getItem('dl_waitlist_email')||''}catch(e){return''}
}

/* ══════════════════════════════════════════════════════════════════
   P/F TOGGLE
   ══════════════════════════════════════════════════════════════════ */
function togglePF(){
  const checked=document.getElementById('isPF')?.checked;
  if(checked) showToast('P/F — '+t('label_pf'),'gold');
}

/* ══════════════════════════════════════════════════════════════════
   MARKUP CONTROLS
   ══════════════════════════════════════════════════════════════════ */
function setMarkup(val){
  val=parseFloat(val);if(isNaN(val)||val<=0)return;
  currentMarkup=val;
  const inp=document.getElementById('markupInput');
  const sld=document.getElementById('markupSlider');
  if(inp)inp.value=val;if(sld)sld.value=Math.min(val,8);
  document.querySelectorAll('.mp').forEach(b=>b.classList.toggle('on',parseFloat(b.dataset.mv)===val));
  calculate();
}
function onMarkupSlide(v){setMarkup(parseFloat(v))}
function onMarkupInput(v){setMarkup(parseFloat(v))}

/* ══════════════════════════════════════════════════════════════════
   COST FORMULA
   Real Cost = (price × amount_base) / ((100 − waste) / 100)
   ══════════════════════════════════════════════════════════════════ */
function calcIngCost(price,amount,unit,waste){
  if(!price||!amount)return 0;
  const wf=(100-Math.min(Math.max(waste||0,0),99))/100;
  if(wf<=0)return 0;
  const base=(unit==='g'||unit==='ml')?amount/1000:amount;
  return(price*base)/wf;
}

/* ══════════════════════════════════════════════════════════════════
   INGREDIENT ROWS
   ══════════════════════════════════════════════════════════════════ */
function addIngredient(data={}){
  rowIdCounter++;const id=rowIdCounter;

  // Apply global price override if set
  const resolvedPrice = data.price || (data.name && window.DB_PRICE_SYNC
    ? String(window.DB_PRICE_SYNC.getEffectivePrice(data.name,''))
    : '');

  const nameF=(cls='')=>`<div class="autocomplete-wrap ${cls}" id="acWrap-${id}"><input class="ing-input" type="text" id="iName-${id}" placeholder="${esc(t('ph_name'))}" data-i18n-ph="ph_name" value="${esc(data.name||'')}" oninput="onIngName(this,${id})" onblur="hideAC(${id})" autocomplete="off" data-field="name"/><div class="autocomplete-list" id="ac-${id}"></div></div>`;
  const amtF=()=>`<input class="ing-input" type="number" min="0" step="0.01" id="iAmt-${id}" placeholder="${esc(t('ph_amount'))}" data-i18n-ph="ph_amount" value="${esc(data.amount||'')}" oninput="calculate()" data-field="amount"/>`;
  const unitF=(u=data.unit||'g')=>`<select class="unit-sel" id="iUnit-${id}" onchange="calculate()" data-field="unit"><option value="g" ${u==='g'?'selected':''}>${t('unit_g')}</option><option value="kg" ${u==='kg'?'selected':''}>${t('unit_kg')}</option><option value="ml" ${u==='ml'?'selected':''}>${t('unit_ml')}</option><option value="l" ${u==='l'?'selected':''}>${t('unit_l')}</option></select>`;

  // Price with last-updated label
  const lastUp = data.name?window.DB_PRICE_SYNC?.getLastUpdated(data.name):null;
  const lastUpStr = lastUp?new Date(lastUp).toLocaleDateString():'';
  const priceF=()=>`<div class="price-field-wrap"><input class="ing-input" type="number" min="0" step="0.01" id="iPrice-${id}" placeholder="${esc(t('ph_price'))}" data-i18n-ph="ph_price" value="${esc(resolvedPrice)}" oninput="calculate()" onchange="onPriceChange(this,${id})" data-field="price"/><span class="price-updated-at" id="iUpdated-${id}">${lastUpStr?t('price_updated_label')+' '+lastUpStr:''}</span></div>`;

  const wasteF=()=>`<input class="ing-input" type="number" min="0" max="99" step="0.1" id="iWaste-${id}" placeholder="${esc(t('ph_waste'))}" data-i18n-ph="ph_waste" value="${data.waste!==undefined?esc(data.waste):''}" oninput="calculate()" data-field="waste"/>`;

  // Supplier chip
  const sup=data.supplier||'';
  const supColor=window.DB_SUPPLIER_COLORS?.[sup]||'rgba(100,116,139,0.8)';
  const supF=()=>`<div class="supplier-cell" id="iSup-${id}">${sup?`<span class="supplier-chip" style="color:${supColor};border-color:${supColor}30;background:${supColor}12">${esc(sup)}</span>`:'<span style="color:var(--muted);font-size:.7rem">—</span>'}</div>`;

  const rmB=()=>`<button class="rm-btn no-print" onclick="removeRow(${id})" aria-label="Remove"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;

  const dRow=document.createElement('div');
  dRow.className='ing-row-desktop';dRow.id='dRow-'+id;dRow.setAttribute('role','row');
  dRow.innerHTML=`${nameF()}${amtF()}${unitF()}${priceF()}${wasteF()}${supF()}<div class="row-cost-cell" id="rowCost-${id}">—</div>${rmB()}`;

  const mRow=document.createElement('div');
  mRow.className='ing-row-mobile';mRow.id='mRow-'+id;
  mRow.innerHTML=`<div class="mob-row-header">${nameF('mob-row-name-wrap')}${rmB()}</div>
    <div class="mob-row-grid-3">
      <div><span class="mob-field-label" data-i18n="th_amount">${t('th_amount')}</span>${amtF()}</div>
      <div><span class="mob-field-label" data-i18n="th_unit">${t('th_unit')}</span>${unitF()}</div>
      <div><span class="mob-field-label" data-i18n="th_waste">${t('th_waste')}</span>${wasteF()}</div>
    </div>
    <div class="mob-row-grid">
      <div><span class="mob-field-label" data-i18n="th_price_per_kg">${t('th_price_per_kg')}</span>${priceF()}</div>
      <div><span class="mob-field-label" data-i18n="th_cost">${t('th_cost')}</span><div class="ing-cost-display" id="mobRowCost-${id}">—</div></div>
    </div>
    ${sup?`<div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span class="mob-field-label">${t('th_supplier')}</span><span class="supplier-chip" style="color:${supColor};border-color:${supColor}30;background:${supColor}12">${esc(sup)}</span></div>`:''}`;

  const container=document.getElementById('ingredientsDiv');
  container.appendChild(dRow);container.appendChild(mRow);
  calculate();
  if(!data.name)setTimeout(()=>document.getElementById('iName-'+id)?.focus(),30);
}
function removeRow(id){
  ['dRow-','mRow-'].forEach(p=>{
    const el=document.getElementById(p+id);
    if(!el)return;
    el.style.transition='opacity .18s,transform .18s';
    el.style.opacity='0';el.style.transform='translateX(-8px)';
    setTimeout(()=>el.remove(),200);
  });
  setTimeout(calculate,220);
}

/* ── Autocomplete (DB + P/F sub-recipes) ── */
/* ──────────────────────────────────────────────────────────────
   P/F COST ENGINE
   Recursively resolves cost of a P/F dish, even if its ingredients
   are themselves P/F items. Prevents infinite loops via a visited set.
   ────────────────────────────────────────────────────────────── */
function calcPFCostPerKg(dish, visitedNames) {
  visitedNames = visitedNames || new Set();
  if (!dish || visitedNames.has((dish.name||'').toLowerCase())) return 0;
  visitedNames.add((dish.name||'').toLowerCase());

  const dishes = loadDB();
  let totalCost = 0;

  (dish.ingredients || []).forEach(ing => {
    const ingName = (ing.name||'').toLowerCase().trim();
    // Check if this ingredient is itself a saved P/F
    const pfSource = dishes.find(d => d.isPF && d.name && d.name.toLowerCase().trim() === ingName);
    let unitPrice;
    if (pfSource) {
      // Recursively get P/F cost-per-kg
      const pfCostPerKg = calcPFCostPerKg(pfSource, new Set(visitedNames));
      unitPrice = pfCostPerKg;
    } else {
      // Check global price override first, then stored price
      const override = window.DB_PRICE_SYNC?.getEffectivePrice(ing.name, null);
      unitPrice = override !== null && override !== undefined
        ? parseFloat(override)
        : parseFloat(ing.price) || 0;
    }
    totalCost += calcIngCost(unitPrice, parseFloat(ing.amount)||0, ing.unit||'g', parseFloat(ing.waste)||0);
  });

  const servings = Math.max(1, parseFloat(dish.servings) || 1);
  const yieldG   = Math.max(1, parseFloat(dish.output)   || 1000);
  const primeCostPerServing = totalCost / servings;
  // Convert to price-per-kg (multiply by 1000/yieldG)
  return (primeCostPerServing / yieldG) * 1000;
}

/* Build virtual DB entries from all saved P/F dishes */
function buildPFEntries() {
  const dishes = loadDB();
  return dishes
    .filter(d => d.isPF && d.name)
    .map(d => {
      const pricePerKg = calcPFCostPerKg(d);
      return {
        name:           d.name,
        name_ru:        d.name,
        name_ua:        d.name,
        category:       'pf',
        price_per_unit: pricePerKg,
        unit:           'kg',
        waste_pct:      0,
        supplier:       'P/F',
        _isPF:          true,
        _dish:          d,
        _pricePerKg:    pricePerKg,
      };
    });
}

/* Get a single P/F entry by name (for cascade sync) */
function getPFEntry(name) {
  return buildPFEntries().find(e => e.name.toLowerCase().trim() === (name||'').toLowerCase().trim()) || null;
}

function onIngName(input,id){
  calculate();
  const q=input.value.trim().toLowerCase();
  const DB=[...(window.INGREDIENT_DB||[]), ...buildPFEntries()];
  const lists=[document.getElementById('ac-'+id)];
  lists.forEach(l=>{if(l)l.classList.remove('open')});
  if(!q||!DB.length)return;
  const nk=currentLang==='en'?'name':('name_'+currentLang);
  const matches=DB.filter(i=>{
    const n=(i[nk]||i.name||'').toLowerCase();
    return n.startsWith(q)||n.includes(q);
  }).slice(0,10);
  if(!matches.length)return;
  const s=sym();
  const catColors=window.DB_CATEGORY_COLORS||{};
  const supColors=window.DB_SUPPLIER_COLORS||{};
  const html=matches.map(item=>{
    const name=item[nk]||item.name;
    const cat=item.category||'other';
    const cc=catColors[cat]||catColors.other||{};
    const catDotColor=cc.text||'#64748b';
    const sup=item.supplier||'';
    const supColor=supColors[sup]||'#64748b';
    const effectivePrice=window.DB_PRICE_SYNC
      ?window.DB_PRICE_SYNC.getEffectivePrice(item.name,item.price_per_unit||0)
      :(item.price_per_unit||0);
    const pfBadge=item._isPF?'<span class="ac-pf-badge">P/F</span>':'';
    const supBadge=sup&&!item._isPF
      ?`<span class="ac-supplier-badge" style="color:${supColor};background:${supColor}15;border:1px solid ${supColor}30">${esc(sup)}</span>`
      :'';
    return `<div class="ac-item" onmousedown="applyAC(${id},'${esc(name)}',${effectivePrice},'${item.unit||'kg'}',${item.waste_pct||0},'${esc(sup)}','${cat}',${item._isPF?'true':'false'})">
      <div class="ac-item-top">
        <span class="ac-cat-dot" style="background:${catDotColor}" title="${cat}"></span>
        <span class="ac-item-name">${esc(name)}</span>
      </div>
      <div class="ac-item-right">
        ${pfBadge}${supBadge}
        <span class="ac-meta" style="display:flex;gap:4px">
          <span>${s}${effectivePrice.toFixed(0)}/${item.unit||'kg'}</span>
          ${item.waste_pct>0?`<span>−${item.waste_pct}%</span>`:''}
        </span>
      </div>
    </div>`;
  }).join('');
  document.querySelectorAll(`#ac-${id}`).forEach(l=>{l.innerHTML=html;l.classList.add('open')});
}

function applyAC(id,name,price,unit,waste,supplier,category,isPF){
  const setV=(fid,val)=>{const el=document.getElementById(fid+id);if(el)el.value=val};

  // Check if we should use a global price override
  const effectivePrice = window.DB_PRICE_SYNC
    ? window.DB_PRICE_SYNC.getEffectivePrice(name, price)
    : price;

  setV('iName-', name);
  setV('iPrice-', parseFloat(effectivePrice||price).toFixed(2));
  setV('iUnit-', {kg:'kg',l:'l',g:'g',ml:'ml'}[unit]||'g');
  setV('iWaste-', waste||0);

  // Update supplier chip
  const sup = supplier||'';
  const supCell = document.getElementById('iSup-'+id);
  if(supCell){
    const supColor = window.DB_SUPPLIER_COLORS?.[sup]||'rgba(100,116,139,0.8)';
    supCell.innerHTML = sup
      ? `<span class="supplier-chip" style="color:${supColor};border-color:${supColor}30;background:${supColor}12">${esc(sup)}</span>`
      : '<span style="color:var(--muted);font-size:.7rem">—</span>';
  }

  // Mark P/F ingredient in the row
  const dRow = document.getElementById('dRow-'+id);
  const mRow = document.getElementById('mRow-'+id);
  if(isPF || category === 'pf'){
    // Add P/F visual marker to the name field wrapper
    const wrap = document.getElementById('acWrap-'+id);
    if(wrap && !wrap.querySelector('.pf-ing-badge')){
      const badge = document.createElement('span');
      badge.className = 'pf-ing-badge';
      badge.setAttribute('aria-label','Semi-finished product');
      badge.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg> P/F`;
      wrap.appendChild(badge);
    }
    if(dRow) dRow.classList.add('ing-row-pf');
    if(mRow) mRow.classList.add('ing-row-pf');
    // Store _isPF flag on price input for cascade detection
    const priceEl = document.getElementById('iPrice-'+id);
    if(priceEl) priceEl.dataset.isPf = '1';
  }

  // Update last-updated label
  const updEl = document.getElementById('iUpdated-'+id);
  if(updEl){
    const ts = window.DB_PRICE_SYNC?.getLastUpdated(name);
    updEl.textContent = ts ? t('price_updated_label')+' '+new Date(ts).toLocaleDateString() : '';
  }

  document.querySelectorAll(`#ac-${id}`).forEach(l=>l.classList.remove('open'));
  calculate();
  setTimeout(()=>document.getElementById('iAmt-'+id)?.focus(),30);
}
function hideAC(id){setTimeout(()=>document.querySelectorAll(`#ac-${id}`).forEach(l=>l.classList.remove('open')),200)}

/* ══════════════════════════════════════════════════════════════════
   GLOBAL PRICE SYNC
   When a price input changes, offer to propagate to all saved recipes
   ══════════════════════════════════════════════════════════════════ */
let _priceSyncPending = null; // { id, name, oldPrice, newPrice }

function onPriceChange(input, id) {
  calculate();
  const newPrice = parseFloat(input.value);
  if (!newPrice || isNaN(newPrice) || newPrice <= 0) return;

  const nameEl = document.getElementById('iName-' + id);
  const name   = (nameEl?.value || '').trim();
  if (!name) return;

  const key = name.toLowerCase().trim();

  // Determine old price (override → DB → nothing)
  const overrides = window.DB_PRICE_SYNC?.loadPriceOverrides() || {};
  const dbItem = window.INGREDIENT_DB?.find(i => i.name.toLowerCase() === key);
  const oldPrice = overrides[key]?.price ?? dbItem?.price_per_unit ?? null;

  if (oldPrice !== null && Math.abs(oldPrice - newPrice) < 0.001) return;

  const dishes = loadDB();

  // Count all recipes using this ingredient directly
  const directCount = dishes.filter(d =>
    (d.ingredients||[]).some(i => i.name.toLowerCase().trim() === key)
  ).length;

  // Count recipes using any P/F that contains this ingredient
  const pfAffected = dishes.filter(d =>
    d.isPF && (d.ingredients||[]).some(i => i.name.toLowerCase().trim() === key)
  );
  const pfNames = new Set(pfAffected.map(d => d.name.toLowerCase().trim()));
  const cascadeCount = dishes.filter(d =>
    !d.isPF && (d.ingredients||[]).some(i => pfNames.has(i.name.toLowerCase().trim()))
  ).length;

  const totalAffected = directCount + cascadeCount;
  if (totalAffected === 0 && oldPrice === null) return;

  _priceSyncPending = { id, name, oldPrice: oldPrice || newPrice, newPrice, key, affectedCount: totalAffected, pfCount: pfAffected.length, cascadeCount };
  openPriceSyncDialog(_priceSyncPending);
}
function openPriceSyncDialog({ name, oldPrice, newPrice, affectedCount, pfCount, cascadeCount }) {
  const ov = document.getElementById('priceSyncDialog');
  if (!ov) return;
  const s = sym();

  document.getElementById('priceSyncIngName').textContent = name;
  document.getElementById('priceSyncOld').textContent     = s + parseFloat(oldPrice||0).toFixed(2);
  document.getElementById('priceSyncNewVal').textContent  = s + parseFloat(newPrice).toFixed(2);

  // Build a richer breakdown message
  const tr = TRANSLATIONS[currentLang];
  const msgFn = tr?.price_sync_msg;
  const msgEl = document.getElementById('priceSyncMsg');
  if (msgEl && typeof msgFn === 'function') msgEl.innerHTML = msgFn(name);

  // Show P/F cascade info if relevant
  const pfInfoEl = document.getElementById('priceSyncPFInfo');
  if (pfInfoEl) {
    if (pfCount > 0) {
      const pfMsg = tr?.price_sync_pf_info
        ? (typeof tr.price_sync_pf_info === 'function' ? tr.price_sync_pf_info(pfCount, cascadeCount||0) : tr.price_sync_pf_info)
        : `Also recalculates ${pfCount} P/F sub-recipe(s) and ${cascadeCount||0} dependent dish(es).`;
      pfInfoEl.textContent = pfMsg;
      pfInfoEl.style.display = 'block';
    } else {
      pfInfoEl.style.display = 'none';
    }
  }

  const yesBtn = document.getElementById('priceSyncYes');
  if (yesBtn) yesBtn.onclick = () => closePriceSync(true);
  ov.classList.add('open');
  ov.setAttribute('aria-hidden', 'false');
  setTimeout(() => yesBtn?.focus(), 150);
}
function closePriceSync(doSync) {
  const ov = document.getElementById('priceSyncDialog');
  if (ov) { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); }

  if (!_priceSyncPending) return;
  const { id, name, newPrice, key } = _priceSyncPending;
  _priceSyncPending = null;

  if (doSync) {
    // 1. Persist global price override
    window.DB_PRICE_SYNC?.setPriceOverride(name, newPrice);

    const dishes = loadDB();
    let updatedCount = 0;
    const today = new Date().toLocaleDateString();

    // 2. Pass 1 – update the raw ingredient price in every recipe that uses it directly
    dishes.forEach(d => {
      let changed = false;
      (d.ingredients || []).forEach(i => {
        if (i.name.toLowerCase().trim() === key) {
          i.price = String(newPrice);
          i._priceUpdatedAt = today;
          changed = true;
        }
      });
      if (changed) updatedCount++;
    });

    // 3. Pass 2 – recalculate any P/F dishes that themselves use this ingredient,
    //    then propagate the updated P/F cost into every recipe using that P/F.
    //    We do two cascading passes to handle P/F → P/F → final dish chains.
    for (let pass = 0; pass < 2; pass++) {
      dishes.forEach(pfDish => {
        if (!pfDish.isPF) return;
        const usesIngredient = (pfDish.ingredients||[]).some(
          i => i.name.toLowerCase().trim() === key ||
               (i._isPF && dishes.some(
                 d2 => d2.isPF && d2.name.toLowerCase().trim() === i.name.toLowerCase().trim()
               ))
        );
        if (!usesIngredient) return;
        // Recalculate P/F cost per kg after the ingredient update
        const newPFPricePerKg = calcPFCostPerKg(pfDish);
        const pfKey = pfDish.name.toLowerCase().trim();
        // Push updated price into all recipes that reference this P/F
        dishes.forEach(d => {
          (d.ingredients||[]).forEach(i => {
            if (i.name.toLowerCase().trim() === pfKey && i._isPF) {
              i.price = String(newPFPricePerKg);
              i._priceUpdatedAt = today;
              if (d !== pfDish) updatedCount++;
            }
          });
        });
      });
    }

    saveDB(dishes);
    renderSaved();

    // 4. Update the last-updated label in the *currently open* calculator row
    const updEl = document.getElementById('iUpdated-' + id);
    if (updEl) updEl.textContent = t('price_updated_label') + ' ' + today;

    // 5. If the current row itself is a P/F usage, refresh its price display
    const priceEl = document.getElementById('iPrice-' + id);
    if (priceEl && parseFloat(priceEl.value) !== newPrice) {
      priceEl.value = newPrice.toFixed(2);
    }

    const tr = TRANSLATIONS[currentLang];
    const doneFn = tr?.price_sync_done;
    const msg = typeof doneFn === 'function'
      ? doneFn(name, updatedCount)
      : `✅ Updated ${updatedCount} recipe(s).`;
    showToast(msg, 'lime');
  }
  calculate();
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATE
   ══════════════════════════════════════════════════════════════════ */
function calculate(){
  const output=Math.max(1,parseFloat(document.getElementById('outputWeight')?.value)||1);
  const servings=Math.max(1,parseInt(document.getElementById('servings')?.value)||1);
  const dRows=document.querySelectorAll('.ing-row-desktop');
  let totalAll=0;
  dRows.forEach(row=>{
    const id=row.id.replace('dRow-','');
    const priceEl=document.getElementById('iPrice-'+id);
    const ingName=document.getElementById('iName-'+id)?.value.trim()||'';
    let price;
    if(priceEl?.dataset.isPf==='1'){
      // Always use live P/F cost-per-kg so stale stored prices don't accumulate
      const pfEntry=getPFEntry(ingName);
      price=pfEntry?pfEntry._pricePerKg:(parseFloat(priceEl?.value)||0);
      // Sync the field display if P/F cost changed
      if(pfEntry && Math.abs(pfEntry._pricePerKg-(parseFloat(priceEl.value)||0))>0.001){
        priceEl.value=pfEntry._pricePerKg.toFixed(4);
      }
    } else {
      // Apply global price override if set, else use field value
      const override=window.DB_PRICE_SYNC?.getEffectivePrice(ingName,null);
      price= (override!==null&&override!==undefined) ? override : (parseFloat(priceEl?.value)||0);
    }
    const amount=parseFloat(document.getElementById('iAmt-'+id)?.value)||0;
    const unit=document.getElementById('iUnit-'+id)?.value||'g';
    const waste=parseFloat(document.getElementById('iWaste-'+id)?.value)||0;
    const cost=calcIngCost(price,amount,unit,waste);
    totalAll+=cost;
    const cs=cost>0?fmt(cost):'—';
    const dc=document.getElementById('rowCost-'+id);const mc=document.getElementById('mobRowCost-'+id);
    if(dc)dc.textContent=cs;if(mc)mc.textContent=cs;
  });
  const prime=totalAll/servings;
  const menu=prime*currentMarkup;
  const per100=(totalAll/output/servings)*100;
  const margin=menu>0?((menu-prime)/menu)*100:0;
  const fcPct=menu>0?(prime/menu)*100:0;
  const hasI=dRows.length>0&&totalAll>0;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set('cost',hasI?fmt(prime):'—');
  set('costPer100',hasI?fmt(per100):'—');
  set('price',hasI?fmt(menu):'—');
  set('margin',hasI?margin.toFixed(1)+'%':'—');
  set('totalCostInline',hasI?fmt(prime):'—');
  set('fcPctLabel',hasI?t('fc_label')+' '+fcPct.toFixed(1)+'%':'—');
  const bar=document.getElementById('marginBar');
  const msgEl=document.getElementById('marginMsg');
  const mrgEl=document.getElementById('margin');
  if(!hasI){if(bar){bar.style.width='0%';bar.style.background=''}if(msgEl){msgEl.textContent=t('msg_margin_idle');msgEl.style.color=''}if(mrgEl)mrgEl.style.color='';return}
  if(bar)bar.style.width=Math.min(Math.max(margin,0),100)+'%';
  let color,msgKey;
  if(margin>=70){color='#2ECC71';msgKey='msg_margin_great'}
  else if(margin>=55){color='#2ECC71';msgKey='msg_margin_good'}
  else if(margin>=40){color='#F59E0B';msgKey='msg_margin_thin'}
  else{color='#EF4444';msgKey='msg_margin_low'}
  if(bar)bar.style.background=color;
  if(msgEl){msgEl.textContent=t(msgKey);msgEl.style.color=color}
  if(mrgEl)mrgEl.style.color=color;
}

/* ── Context for AI ── */
function getCtx(){
  const dRows=document.querySelectorAll('.ing-row-desktop');
  const servings=Math.max(1,parseInt(document.getElementById('servings')?.value)||1);
  let totalAll=0;
  dRows.forEach(row=>{
    const id=row.id.replace('dRow-','');
    totalAll+=calcIngCost(
      parseFloat(document.getElementById('iPrice-'+id)?.value)||0,
      parseFloat(document.getElementById('iAmt-'+id)?.value)||0,
      document.getElementById('iUnit-'+id)?.value||'g',
      parseFloat(document.getElementById('iWaste-'+id)?.value)||0
    );
  });
  const prime=totalAll/servings;
  const menu=prime*currentMarkup;
  const margin=menu>0?((menu-prime)/menu)*100:0;
  const cat=document.getElementById('category')?.value||'other';
  const dish=document.getElementById('dishName')?.value.trim()||'';
  const ingNames=[];
  dRows.forEach(row=>{const id=row.id.replace('dRow-','');const n=document.getElementById('iName-'+id)?.value.trim();if(n)ingNames.push(n)});
  return{prime,menu,margin,cat,dish,ingNames,hasIng:dRows.length>0&&totalAll>0};
}

/* ══════════════════════════════════════════════════════════════════
   SAVE / LOAD / DELETE
   ══════════════════════════════════════════════════════════════════ */
function getFormData(){
  const dRows=document.querySelectorAll('.ing-row-desktop');
  const ingredients=[];
  dRows.forEach(row=>{
    const id=row.id.replace('dRow-','');
    const supEl = document.getElementById('iSup-'+id);
    const supChip = supEl?.querySelector('.supplier-chip');
    const priceEl2 = document.getElementById('iPrice-'+id);
    const ingIsPF = priceEl2?.dataset.isPf === '1';
    const ingName = document.getElementById('iName-'+id)?.value.trim()||'';
    // Always use live P/F price if this is a P/F ingredient
    let ingPrice = priceEl2?.value||'';
    if(ingIsPF){
      const pfEntry = getPFEntry(ingName);
      if(pfEntry) ingPrice = String(pfEntry._pricePerKg.toFixed(4));
    }
    ingredients.push({
      name:    ingName,
      amount:  document.getElementById('iAmt-'+id)?.value||'',
      unit:    document.getElementById('iUnit-'+id)?.value||'g',
      price:   ingPrice,
      waste:   document.getElementById('iWaste-'+id)?.value||'',
      supplier:supChip?.textContent.trim()||'',
      _isPF:   ingIsPF,
    });
  });
  return{
    name:document.getElementById('dishName')?.value.trim()||'',
    category:document.getElementById('category')?.value,
    output:document.getElementById('outputWeight')?.value,
    servings:document.getElementById('servings')?.value,
    markup:currentMarkup,
    isPF:document.getElementById('isPF')?.checked||false,
    ingredients,savedAt:Date.now(),
  };
}

function saveDish(){
  let data=getFormData();
  if(!data.ingredients.length){showToast(t('msg_no_ing'),'danger');return}
  // Auto-set supplier + defaults for P/F items
  data = applyPFDefaults(data);
  const dishes=loadDB();
  const idx=dishes.findIndex(d=>d.name===data.name&&data.name!=='');
  if(idx>-1)dishes[idx]=data;else dishes.push(data);
  saveDB(dishes);
  renderSaved();
  // Also refresh PF library and tab badge
  const tabBadge = document.getElementById('pfTabCount');
  const pfCount = loadDB().filter(d=>d.isPF).length;
  if (tabBadge) {
    tabBadge.textContent = pfCount;
    tabBadge.style.display = pfCount > 0 ? 'inline-block' : 'none';
  }
  if (activeTab === 'pf-library') renderPFLibrary();
  const isSavedPF = data.isPF;
  showToast(isSavedPF ? '⭐ '+t('pf_saved_ok')||'⭐ P/F saved!' : '💾 '+t('msg_saved_ok'), 'lime');
}

function loadDish(index){
  const dish=loadDB()[index];if(!dish)return;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v};
  set('dishName',dish.name);set('category',dish.category);
  set('outputWeight',dish.output);set('servings',dish.servings||1);
  setMarkup(dish.markup||3);
  const pfEl=document.getElementById('isPF');if(pfEl)pfEl.checked=dish.isPF||false;
  document.getElementById('ingredientsDiv').innerHTML='';rowIdCounter=0;
  (dish.ingredients||[]).forEach(i=>addIngredient(i));
  // Re-apply P/F visual markers after loading
  requestAnimationFrame(() => {
    const dRows = document.querySelectorAll('.ing-row-desktop');
    dRows.forEach(row => {
      const rid = row.id.replace('dRow-','');
      const priceEl = document.getElementById('iPrice-'+rid);
      if(!priceEl) return;
      const ingName = document.getElementById('iName-'+rid)?.value.trim()||'';
      const saved = dish.ingredients?.find(i => i.name === ingName);
      if(saved?._isPF){
        priceEl.dataset.isPf = '1';
        row.classList.add('ing-row-pf');
        document.getElementById('mRow-'+rid)?.classList.add('ing-row-pf');
        const wrap = document.getElementById('acWrap-'+rid);
        if(wrap && !wrap.querySelector('.pf-ing-badge')){
          const badge = document.createElement('span');
          badge.className = 'pf-ing-badge';
          badge.setAttribute('aria-label','Semi-finished product');
          badge.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg> P/F`;
          wrap.appendChild(badge);
        }
      }
    });
  });
  calculate();showToast('📂 '+t('msg_loaded'),'lime');
  window.scrollTo({top:0,behavior:'smooth'});
}

function deleteDish(index){
  const dishes=loadDB();dishes.splice(index,1);saveDB(dishes);renderSaved();showToast(t('msg_deleted'));
}

function renderSaved(){
  const dishes=loadDB();
  const list=document.getElementById('savedList');
  const empty=document.getElementById('savedEmpty');
  const counter=document.getElementById('savedCount');
  const pfCounter=document.getElementById('pfCount');

  // Split into P/F and regular for counter
  const pfDishes    = dishes.filter(d => d.isPF);
  const finalDishes = dishes.filter(d => !d.isPF);

  if(counter) counter.textContent = dishes.length;
  if(pfCounter){
    if(pfDishes.length > 0){
      pfCounter.textContent = pfDishes.length + ' P/F';
      pfCounter.style.display = 'inline-block';
    } else {
      pfCounter.style.display = 'none';
    }
  }
  // Sync the tab nav badge
  const tabBadge = document.getElementById('pfTabCount');
  if(tabBadge){
    tabBadge.textContent = pfDishes.length;
    tabBadge.style.display = pfDishes.length > 0 ? 'inline-block' : 'none';
  }

  if(!dishes.length){
    if(list) list.innerHTML='';
    if(empty){ empty.style.display='block'; empty.textContent=t('msg_no_saved'); }
    return;
  }
  if(empty) empty.style.display='none';

  const catMap={starter:t('cat_starter'),main:t('cat_main'),dessert:t('cat_dessert'),drink:t('cat_drink'),other:t('cat_other')};
  const s=sym();

  // Render P/F section first if any exist
  let html = '';

  if(pfDishes.length > 0){
    html += `<div class="saved-section-label">
      <span class="pf-section-icon" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>
      </span>
      <span data-i18n="label_pf_section">${t('label_pf_section')}</span>
    </div>`;

    pfDishes.forEach(d => {
      const i = dishes.indexOf(d);
      const pricePerKg = calcPFCostPerKg(d);
      const date = d.savedAt ? new Date(d.savedAt).toLocaleDateString() : '';
      const ingCount = (d.ingredients||[]).length;
      html += renderSavedItem(d, i, s, catMap, date, true, pricePerKg, ingCount);
    });
  }

  if(finalDishes.length > 0){
    if(pfDishes.length > 0){
      html += `<div class="saved-section-label saved-section-label-final">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span data-i18n="label_final_section">${t('label_final_section')}</span>
      </div>`;
    }
    finalDishes.forEach(d => {
      const i = dishes.indexOf(d);
      let cost=0;
      (d.ingredients||[]).forEach(ing=>{
        const ingKey = (ing.name||'').toLowerCase().trim();
        // If this ingredient is a P/F, get its live cost-per-kg
        const pfSource = dishes.find(dd => dd.isPF && dd.name && dd.name.toLowerCase().trim() === ingKey);
        const unitPrice = pfSource
          ? calcPFCostPerKg(pfSource)
          : (parseFloat(ing.price)||0);
        cost += calcIngCost(unitPrice, parseFloat(ing.amount)||0, ing.unit||'g', parseFloat(ing.waste)||0);
      });
      const menuP=(cost/(parseFloat(d.servings)||1))*(d.markup||3);
      const date=d.savedAt?new Date(d.savedAt).toLocaleDateString():'';
      html += renderSavedItem(d, i, s, catMap, date, false, menuP, (d.ingredients||[]).length);
    });
  }

  if(list) list.innerHTML = html;
}

function renderSavedItem(d, i, s, catMap, date, isPF, mainCost, ingCount){
  const pfTagHtml = isPF
    ? `<span class="pf-tag-sm" aria-label="Semi-finished product">P/F</span>`
    : '';
  const catLabel = catMap[d.category] || d.category || '';
  const costLabel = isPF
    ? `${s}${mainCost.toFixed(2)}<span class="saved-cost-unit">/kg</span>`
    : `${s}${mainCost.toFixed(2)}`;
  const ingLabel = ingCount > 0
    ? `<span class="saved-ing-count">${ingCount} ing.</span>`
    : '';

  return `<div class="saved-item${isPF?' saved-item-pf':''}" role="listitem" onclick="loadDish(${i})">
    <div class="saved-item-info">
      <span class="saved-item-name">${esc(d.name||'Recipe #'+(i+1))}</span>
      <span class="saved-item-meta">${pfTagHtml}${esc(catLabel)} · ${date} ${ingLabel}</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span class="saved-item-cost${isPF?' saved-item-cost-pf':''}">${costLabel}</span>
      <div class="saved-item-btns" onclick="event.stopPropagation()">
        <button class="si-btn" onclick="loadDish(${i})" data-i18n="btn_load">${t('btn_load')}</button>
        <button class="si-btn del" onclick="deleteDish(${i})" aria-label="Delete">✕</button>
      </div>
    </div>
  </div>`;
}
function resetForm(){
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v};
  set('dishName','');set('outputWeight','300');set('servings','1');
  const pf=document.getElementById('isPF');if(pf)pf.checked=false;
  document.getElementById('ingredientsDiv').innerHTML='';rowIdCounter=0;
  setMarkup(3);addIngredient();addIngredient();calculate();showToast(t('msg_reset'));
}

function loadDB(){try{return JSON.parse(localStorage.getItem('dl_dishes')||'[]')}catch(e){return[]}}
function saveDB(d){try{localStorage.setItem('dl_dishes',JSON.stringify(d))}catch(e){}}

/* ══════════════════════════════════════════════════════════════════
   ★  SECTION 2 — ASYNC DATA LAYER  (Cloud Sync Ready)
   ══════════════════════════════════════════════════════════════════
   All persistence goes through these async wrappers.
   Currently backed by localStorage — swap bodies for Supabase/API.
   ══════════════════════════════════════════════════════════════════ */

/* ── Auth state (populated by Supabase session in production) ── */
let _authUser = null;   // { id, email, tier } once logged in

/** Get current authenticated user (null if anonymous) */
function getAuthUser() { return _authUser; }

/**
 * Simulate login — REPLACE body with Supabase signInWithOtp / OAuth.
 * Called from the Login button in the header.
 */
async function authLogin(email) {
  // TODO: Connect to Supabase — await supabase.auth.signInWithOtp({ email })
  // For now, store email locally and mark as PRO for demo
  try { localStorage.setItem('dl_auth_email', email); } catch(e) {}
  _authUser = { id: 'local-' + Date.now(), email, tier: getCurrentTier() };
  updateAuthUI(_authUser);
  showToast('✅ Signed in as ' + email, 'lime');
}

/** Sign out */
async function authLogout() {
  // TODO: Connect to Supabase — await supabase.auth.signOut()
  _authUser = null;
  try { localStorage.removeItem('dl_auth_email'); } catch(e) {}
  updateAuthUI(null);
  showToast(t('auth_signed_out') || 'Signed out.', '');
}

/** Restore session on load */
function restoreAuthSession() {
  // TODO: Connect to Supabase — supabase.auth.getSession()
  try {
    const email = localStorage.getItem('dl_auth_email');
    if (email) _authUser = { id:'local', email, tier: getCurrentTier() };
  } catch(e) {}
  updateAuthUI(_authUser);
}

/** Update header auth button appearance */
// updateAuthUI moved to Section 4

/**
 * ── RECIPE CRUD ────────────────────────────────────────────────
 */

/**
 * saveRecipe(data) — persists a single recipe.
 * @param {Object} data — full recipe object from getFormData()
 * @returns {Promise<void>}
 */
async function saveRecipe(data) {
  // TODO: Connect to Supabase
  //   const { error } = await supabase.from('recipes')
  //     .upsert({ ...data, user_id: _authUser?.id }, { onConflict:'name' });
  //   if (error) throw error;
  // ── localStorage fallback ──
  const dishes = loadDB();
  const idx = dishes.findIndex(d => d.name === data.name && data.name !== '');
  if (idx > -1) dishes[idx] = data; else dishes.push(data);
  saveDB(dishes);
}

/**
 * fetchRecipes() — retrieves all recipes for current user.
 * @returns {Promise<Array>}
 */
async function fetchRecipes() {
  // TODO: Connect to Supabase
  //   const { data, error } = await supabase.from('recipes')
  //     .select('*').eq('user_id', _authUser?.id).order('savedAt', { ascending:false });
  //   if (error) throw error;
  //   return data;
  // ── localStorage fallback ──
  return loadDB();
}

/**
 * deleteRecipe(name) — removes a recipe by name.
 * @param {string} name
 * @returns {Promise<void>}
 */
async function deleteRecipe(name) {
  // TODO: Connect to Supabase
  //   await supabase.from('recipes').delete()
  //     .eq('name', name).eq('user_id', _authUser?.id);
  // ── localStorage fallback ──
  const dishes = loadDB().filter(d => d.name !== name);
  saveDB(dishes);
}

/**
 * ── INGREDIENT / PRICE DATA ──────────────────────────────────
 */

/**
 * fetchIngredients() — returns the full ingredient DB + price overrides.
 * @returns {Promise<Array>}
 */
async function fetchIngredients() {
  // TODO: Connect to Supabase
  //   const { data } = await supabase.from('ingredients')
  //     .select('*').order('name');
  //   return data;
  // ── localStorage fallback ──
  const overrides = window.DB_PRICE_SYNC?.loadPriceOverrides() || {};
  return (window.INGREDIENT_DB || []).map(item => ({
    ...item,
    effectivePrice: overrides[item.name.toLowerCase()]?.price ?? item.price_per_unit,
    updatedAt:      overrides[item.name.toLowerCase()]?.updatedAt ?? null,
  }));
}

/**
 * updateIngredientPrice(name, price) — saves a global price override.
 * @param {string} name
 * @param {number} price
 * @returns {Promise<void>}
 */
async function updateIngredientPrice(name, price) {
  // TODO: Connect to Supabase
  //   await supabase.from('ingredient_prices')
  //     .upsert({ name, price, updated_by: _authUser?.id, updated_at: new Date() });
  // ── localStorage fallback ──
  window.DB_PRICE_SYNC?.setPriceOverride(name, price);
}

/**
 * ── TIER / SUBSCRIPTION ──────────────────────────────────────
 */

/**
 * fetchUserTier() — reads tier from server/session.
 * @returns {Promise<string>}  one of TIER values
 */
async function fetchUserTier() {
  // TODO: Connect to Supabase
  //   const { data } = await supabase.from('subscriptions')
  //     .select('tier').eq('user_id', _authUser?.id).single();
  //   return data?.tier ?? TIER.FREE;
  // ── localStorage fallback ──
  return getCurrentTier();
}



/* ══════════════════════════════════════════════════════════════════
   AI CHAT
   ══════════════════════════════════════════════════════════════════ */
function toggleChat(){
  chatOpen=!chatOpen;
  const win=document.getElementById('aiChatWindow');
  const btn=document.getElementById('aiFloatBtn');
  win.classList.toggle('visible',chatOpen);
  btn.classList.toggle('open',chatOpen);
  win.setAttribute('aria-hidden',String(!chatOpen));
  btn.setAttribute('aria-expanded',String(chatOpen));
  if(chatOpen&&!chatInitialised){chatInitialised=true;addAIMsg(t('ai_welcome'))}
  if(chatOpen){
    setTimeout(()=>document.getElementById('aiChatInput')?.focus(),200);
  } else {
    // Stop voice recording if chat is closed mid-recording
    if(voiceActive) stopVoice();
  }
}

function addUserMsg(text){
  const msgs=document.getElementById('aiMessages');if(!msgs)return;
  const row=document.createElement('div');row.className='msg-row user';
  row.innerHTML=`<div class="msg-avatar user-av" aria-hidden="true">You</div><div class="msg-bubble user">${esc(text)}</div>`;
  msgs.appendChild(row);scrollMsgs();
}

function addAIMsg(text){
  const msgs=document.getElementById('aiMessages');if(!msgs)return;
  const row=document.createElement('div');row.className='msg-row ai';
  const html=esc(text).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>');
  row.innerHTML=`<div class="msg-avatar ai-av" aria-hidden="true">AI</div><div class="msg-bubble ai">${html}</div>`;
  msgs.appendChild(row);scrollMsgs();
}

function addTyping(){
  const msgs=document.getElementById('aiMessages');if(!msgs)return;
  const row=document.createElement('div');row.className='msg-row ai';row.id='typingRow';
  row.innerHTML=`<div class="msg-avatar ai-av" aria-hidden="true">AI</div><div class="msg-bubble ai"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(row);scrollMsgs();
}

function removeTyping(){document.getElementById('typingRow')?.remove()}
function scrollMsgs(){const m=document.getElementById('aiMessages');if(m)setTimeout(()=>m.scrollTo({top:m.scrollHeight,behavior:'smooth'}),50)}

async function sendChatMessage(){
  const inp=document.getElementById('aiChatInput');
  const text=inp?.value.trim();if(!text)return;
  inp.value='';addUserMsg(text);addTyping();
  if(USE_REAL_AI&&OPENAI_API_KEY){
    try{const r=await callRealAI(text);removeTyping();addAIMsg(r)}
    catch(e){removeTyping();addAIMsg('⚠ API error: '+e.message)}
  }else{
    setTimeout(()=>{removeTyping();addAIMsg(processAIRequest(text))},600+Math.random()*400);
  }
}

function quickAction(action){
  const labels={margin75:t('qa_margin75'),waste:t('qa_waste'),subs:t('qa_subs'),analyze:t('qa_analyze'),menutext:t('qa_menutext')};
  addUserMsg(labels[action]||action);addTyping();
  setTimeout(()=>{removeTyping();addAIMsg(processAIRequest(action))},600+Math.random()*400);
}

/* ══════════════════════════════════════════════════════════════════
   SMART MOCK AI PROCESSOR
   ══════════════════════════════════════════════════════════════════ */
function processAIRequest(query){
  const q=query.toLowerCase();
  const tr=TRANSLATIONS[currentLang];
  const s=sym();
  const ctx=getCtx();

  /* 1. 75% margin */
  if(q==='margin75'||q.includes('75%')||(q.includes('margin')&&q.includes('75'))||(q.includes('маржа')&&q.includes('75'))||(q.includes('маржу')&&q.includes('75'))){
    if(!ctx.hasIng)return tr.ai_margin75_no_cost||t('ai_margin75_no_cost');
    const tp=ctx.prime/0.25;
    setTimeout(()=>setMarkup(parseFloat((tp/ctx.prime).toFixed(2))),100);
    const fn=tr.ai_margin75_result;
    return typeof fn==='function'?fn(ctx.prime.toFixed(2),tp.toFixed(2),s):t('ai_margin75_no_cost');
  }

  /* 2. Menu Text */
  if(q==='menutext'||q.includes('menu text')||q.includes('description')||q.includes('описание')||q.includes('опис')||q.includes('текст меню')){
    if(!ctx.hasIng)return tr.ai_menutext_empty||t('ai_menutext_empty');
    const fn=tr.ai_menutext;
    return typeof fn==='function'?fn(ctx.dish,ctx.ingNames,ctx.cat,ctx.menu.toFixed(2),s):'';
  }

  /* 3. Analyze */
  if(q==='analyze'||q.includes('analyz')||q.includes('analys')||q.includes('анализ')||q.includes('аналіз')){
    if(!ctx.hasIng)return tr.ai_analyze_empty||t('ai_analyze_empty');
    const fn=tr.ai_analyze;
    return typeof fn==='function'?fn(ctx.prime.toFixed(2),ctx.menu.toFixed(2),ctx.margin,ctx.cat,s):'';
  }

  /* 4. Waste */
  if(q==='waste'||q.includes('waste')||q.includes('loss')||q.includes('отход')||q.includes('відхід')||q.includes('shrink')||q.includes('уварив')){
    const wDB=tr.ai_waste_data||{};
    for(const key of Object.keys(wDB)){
      if(q.includes(key)){
        const entry=wDB[key];
        const rows=document.querySelectorAll('.ing-row-desktop');
        let found=false;
        rows.forEach(row=>{
          const id=row.id.replace('dRow-','');
          const nameEl=document.getElementById('iName-'+id);
          if(nameEl&&nameEl.value.trim().toLowerCase().includes(key)){
            const wEl=document.getElementById('iWaste-'+id);
            if(wEl){wEl.value=entry.pct;found=true}
          }
        });
        if(found){calculate();return typeof tr.ai_waste_applied==='function'?tr.ai_waste_applied(key,entry.pct):''}
        return typeof tr.ai_waste_intro==='function'?tr.ai_waste_intro(key.charAt(0).toUpperCase()+key.slice(1),entry.pct,entry.tip):'';
      }
    }
    if(q==='waste'){
      const lines=Object.entries(wDB).map(([k,v])=>`• ${k.charAt(0).toUpperCase()+k.slice(1)}: ~${v.pct}%`).join('\n');
      return `📋 **Waste Reference**\n\n${lines}\n\nMention an ingredient to auto-apply waste%.`;
    }
    const ing=q.replace(/waste|loss|отход|відхід|shrink|of|для/g,'').trim();
    return typeof tr.ai_waste_unknown==='function'?tr.ai_waste_unknown(ing):'';
  }

  /* 5. Subs */
  if(q==='subs'||q.includes('sub')||q.includes('replac')||q.includes('cheaper')||q.includes('замен')||q.includes('замін')||q.includes('дешев')){
    const sDB=tr.ai_subs_data||{};
    for(const key of Object.keys(sDB)){
      if(q.includes(key))return typeof tr.ai_subs_intro==='function'?tr.ai_subs_intro(key.charAt(0).toUpperCase()+key.slice(1),sDB[key]):'';
    }
    if(q==='subs'){
      const keys=Object.keys(sDB).map(k=>k.charAt(0).toUpperCase()+k.slice(1)).join(', ');
      return `💡 Swap suggestions available for: **${keys}**.\n\nMention an ingredient name.`;
    }
    const ing=q.replace(/sub|replac|cheaper|замен|замін|дешев/g,'').trim();
    return typeof tr.ai_subs_unknown==='function'?tr.ai_subs_unknown(ing):'';
  }

  /* 6. Cost context */
  if(q.includes('cost')||q.includes('expensive')||q.includes('себестоим')||q.includes('собівартість')||q.includes('дорог')){
    if(!ctx.hasIng)return'Add ingredients first.';
    const thr={starter:5,main:15,dessert:4,drink:3};
    const limit=thr[ctx.cat]||10;
    if(ctx.prime>limit)return `Prime cost **${s}${ctx.prime.toFixed(2)}** is on the high side for a ${ctx.cat}.\n\n• Check waste percentages\n• Consider cheaper swaps\n• Reduce portion by 5–10%`;
    return `Prime cost **${s}${ctx.prime.toFixed(2)}** looks good for a ${ctx.cat}. Margin: ${ctx.margin.toFixed(1)}%.`;
  }

  /* 7. Fallback */
  return tr.ai_custom_fallback||t('ai_custom_fallback');
}

/* ══════════════════════════════════════════════════════════════════
   REAL AI CALL
   ══════════════════════════════════════════════════════════════════ */
function buildSystemPrompt(){
  const ctx=getCtx();
  return `You are Chef AI for Dishlytics.\nRecipe: "${ctx.dish}" | Category: ${ctx.cat} | Markup: ×${currentMarkup}\nIngredients: ${ctx.ingNames.join(', ')||'none'}\nPrime: ${sym()}${ctx.prime.toFixed(2)} | Menu: ${sym()}${ctx.menu.toFixed(2)} | Margin: ${ctx.margin.toFixed(1)}%\nLanguage: ${currentLang==='ru'?'Russian':currentLang==='ua'?'Ukrainian':'English'}. Be concise.`;
}

async function callRealAI(userMsg){
  const res=await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+OPENAI_API_KEY},
    body:JSON.stringify({model:OPENAI_MODEL,max_tokens:450,messages:[{role:'system',content:buildSystemPrompt()},{role:'user',content:userMsg}]}),
  });
  if(!res.ok)throw new Error('HTTP '+res.status);
  const d=await res.json();return d.choices?.[0]?.message?.content||'(no response)';
}

/* ══════════════════════════════════════════════════════════════════
   MOBILE MENU
   ══════════════════════════════════════════════════════════════════ */
function toggleMobMenu(){
  const menu=document.getElementById('mobMenu');
  const ham=document.getElementById('mobHam');
  if(!menu)return;
  menu.classList.toggle('open');
  ham?.setAttribute('aria-expanded',String(menu.classList.contains('open')));
}

/* ══════════════════════════════════════════════════════════════════
   PDF EXPORT
   ══════════════════════════════════════════════════════════════════ */
function exportPDF(){
  const catMap={starter:t('cat_starter'),main:t('cat_main'),dessert:t('cat_dessert'),drink:t('cat_drink'),other:t('cat_other')};
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  const cat=document.getElementById('category')?.value||'';
  set('printDishName',document.getElementById('dishName')?.value.trim()||'—');
  set('printCategory',catMap[cat]||cat);
  set('printYield',(document.getElementById('outputWeight')?.value||'—')+'g');
  set('printServings',(document.getElementById('servings')?.value||'1')+' srv');
  set('printDate',new Date().toLocaleDateString(currentLang==='ua'?'uk-UA':currentLang==='ru'?'ru-RU':'en-US',{day:'2-digit',month:'short',year:'numeric'}));
  const pt=document.querySelector('#printHeader .print-tagline');if(pt)pt.textContent=t('print_tagline');
  window.print();
}

/* ══════════════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════════════ */
let _tt;
function showToast(msg,type=''){
  const el=document.getElementById('toast');if(!el)return;
  clearTimeout(_tt);el.textContent=msg;el.className='toast no-print show '+type;
  _tt=setTimeout(()=>el.classList.remove('show'),2800);
}

/* ══════════════════════════════════════════════════════════════════
   VOICE INPUT  —  Web Speech API
   ══════════════════════════════════════════════════════════════════
   Supports EN, RU, UA via the lang map below.
   Degrades gracefully when browser has no SpeechRecognition support.
   ══════════════════════════════════════════════════════════════════ */

/* ── Language codes for Web Speech API ── */
const VOICE_LANG_MAP = {
  en: 'en-US',
  ru: 'ru-RU',
  ua: 'uk-UA',   // ISO 639 for Ukrainian
};

/* ── Module-level state ── */
let voiceRecognition  = null;   // SpeechRecognition instance
let voiceActive       = false;  // true while microphone is open
let voiceSupported    = false;  // set during init

/* ── i18n strings for voice UI (keyed into TRANSLATIONS) ── */
// EN keys already in TRANSLATIONS:
//   voice_listening, voice_not_supported, voice_error_no_mic,
//   voice_error_network, voice_error_generic, voice_tap_to_speak
// Added to each lang block further down via addVoiceI18n().

/* ────────────────────────────────────────────────────────────
   INIT — called from DOMContentLoaded
   ──────────────────────────────────────────────────────────── */
function initVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const micBtn = document.getElementById('aiMicBtn');

  if (!SpeechRecognition) {
    voiceSupported = false;
    if (micBtn) {
      micBtn.classList.add('unsupported');
      micBtn.title = t('voice_not_supported') || 'Voice input not supported in this browser';
      micBtn.setAttribute('aria-disabled', 'true');
    }
    return;
  }

  voiceSupported = true;
  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous    = false;   // single utterance per tap
  voiceRecognition.interimResults = true;   // show text as you speak
  voiceRecognition.maxAlternatives = 1;
  voiceRecognition.lang = VOICE_LANG_MAP[currentLang] || 'en-US';

  /* ── onstart ── */
  voiceRecognition.onstart = () => {
    voiceActive = true;
    _setVoiceUI(true);
  };

  /* ── onresult — update input field in real time ── */
  voiceRecognition.onresult = (event) => {
    let interim = '';
    let final   = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }

    const input = document.getElementById('aiChatInput');
    if (!input) return;

    // Show interim as grey placeholder-like text
    if (interim) {
      input.value = interim;
      input.classList.add('listening');
      const label = document.getElementById('voiceLabel');
      if (label) {
        label.textContent = interim;
        label.classList.add('has-text');
      }
    }

    // On final result: fill input and auto-submit
    if (final.trim()) {
      input.value = final.trim();
      input.classList.remove('listening');
      // Small delay so user sees the text before it disappears
      setTimeout(() => sendChatMessage(), 320);
    }
  };

  /* ── onerror ── */
  voiceRecognition.onerror = (event) => {
    voiceActive = false;
    _setVoiceUI(false);
    const input = document.getElementById('aiChatInput');
    if (input) { input.value = ''; input.classList.remove('listening'); }

    const msgs = {
      'not-allowed':  t('voice_error_no_mic')     || '🎤 Microphone access denied. Check browser permissions.',
      'network':      t('voice_error_network')    || '🌐 Network error. Voice recognition requires internet.',
      'no-speech':    null,    // silent — user just didn't speak
      'audio-capture': t('voice_error_no_mic')   || '🎤 No microphone found.',
    };
    const msg = msgs[event.error];
    if (msg) showToast(msg, 'danger');
  };

  /* ── onend ── */
  voiceRecognition.onend = () => {
    voiceActive = false;
    _setVoiceUI(false);
    const input = document.getElementById('aiChatInput');
    if (input) input.classList.remove('listening');
  };
}

/* ────────────────────────────────────────────────────────────
   PUBLIC API
   ──────────────────────────────────────────────────────────── */
function toggleVoice() {
  if (!voiceSupported) {
    showToast(t('voice_not_supported') || 'Voice input not supported in this browser.', 'danger');
    return;
  }
  if (voiceActive) {
    stopVoice();
  } else {
    startVoice();
  }
}

function startVoice() {
  if (!voiceSupported || !voiceRecognition) return;
  // Update language to match current UI lang
  voiceRecognition.lang = VOICE_LANG_MAP[currentLang] || 'en-US';
  try {
    const input = document.getElementById('aiChatInput');
    if (input) { input.value = ''; input.focus(); }
    voiceRecognition.start();
  } catch(e) {
    // Recognition already running — stop and restart
    voiceRecognition.stop();
    setTimeout(startVoice, 250);
  }
}

function stopVoice() {
  if (!voiceSupported || !voiceRecognition) return;
  voiceRecognition.stop();
  // onend will call _setVoiceUI(false)
}

/* ────────────────────────────────────────────────────────────
   INTERNAL UI STATE TOGGLE
   ──────────────────────────────────────────────────────────── */
function _setVoiceUI(listening) {
  const micBtn   = document.getElementById('aiMicBtn');
  const voiceBar = document.getElementById('voiceBar');
  const voiceLabel = document.getElementById('voiceLabel');

  if (micBtn) {
    micBtn.classList.toggle('recording', listening);
    micBtn.setAttribute('aria-label', listening
      ? (t('voice_stop') || 'Stop listening')
      : (t('voice_start') || 'Voice input')
    );
    micBtn.title = listening
      ? (t('voice_stop') || 'Stop listening')
      : (t('voice_tap_to_speak') || 'Tap to speak');
  }

  if (voiceBar) {
    voiceBar.classList.toggle('active', listening);
    voiceBar.setAttribute('aria-hidden', String(!listening));
  }

  if (voiceLabel && listening) {
    voiceLabel.textContent = t('voice_listening') || 'Listening…';
    voiceLabel.classList.remove('has-text');
  }

  // Also update float button appearance subtly
  const floatBtn = document.getElementById('aiFloatBtn');
  if (floatBtn) floatBtn.classList.toggle('voice-active', listening);
}

/* ────────────────────────────────────────────────────────────
   LANGUAGE SYNC  —  update recognition lang when UI lang changes
   ──────────────────────────────────────────────────────────── */
function syncVoiceLang() {
  if (voiceRecognition) {
    voiceRecognition.lang = VOICE_LANG_MAP[currentLang] || 'en-US';
  }
}


/* ══════════════════════════════════════════════════════════════════
   ★  SECTION 4 — AUTH UI — Login Modal & Header Button
   ══════════════════════════════════════════════════════════════════ */

/** Open the login modal and populate based on current auth state */
function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (_authUser) {
    _showSignedInState(_authUser);
  } else {
    _showSignedOutState();
  }
  setTimeout(() => document.getElementById('loginEmailInput')?.focus(), 200);
}

/** Close the login modal */
function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/** Overlay click handler */
function handleLoginOverlayClick(e) {
  if (e.target === document.getElementById('loginModal')) closeLoginModal();
}

/** Show signed-out form state */
function _showSignedOutState() {
  const form      = document.getElementById('loginForm');
  const signedIn  = document.getElementById('loginSignedIn');
  if (form)     form.style.display     = 'block';
  if (signedIn) signedIn.style.display = 'none';
}

/** Show signed-in info state */
function _showSignedInState(user) {
  const form      = document.getElementById('loginForm');
  const signedIn  = document.getElementById('loginSignedIn');
  if (form)     form.style.display     = 'none';
  if (signedIn) signedIn.style.display = 'block';

  const emailEl = document.getElementById('loginEmailDisplay');
  if (emailEl) emailEl.textContent = user.email || '—';

  const tierBadge = document.getElementById('loginTierBadge');
  if (tierBadge) {
    const tier = getCurrentTier();
    const labels = { FREE:t('tier_free_badge'), PRO:t('tier_pro_name'), EXECUTIVE:t('tier_exec_name') };
    tierBadge.textContent = labels[tier] || tier;
    tierBadge.className = `tier-badge ${tier.toLowerCase()}`;
  }

  const recipeCount = document.getElementById('loginRecipeCount');
  if (recipeCount) {
    const saved = loadDB().length;
    const limit = getCurrentTier() === TIER.FREE ? `/ ${FREE_RECIPE_LIMIT}` : ' / ∞';
    recipeCount.textContent = saved + limit;
  }
}

/** Handle login form submission */
async function submitLogin() {
  const email = (document.getElementById('loginEmailInput')?.value || '').trim();
  if (!email || !email.includes('@')) {
    document.getElementById('loginEmailInput')?.focus();
    showToast(t('auth_email_ph') || 'Enter a valid email address.', 'danger');
    return;
  }
  const btn = document.getElementById('loginSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  await authLogin(email);

  if (btn) { btn.disabled = false; btn.textContent = t('auth_sign_in') || 'Send Magic Link'; }
  closeLoginModal();
}

/** Handle sign-out button */
async function submitLogout() {
  await authLogout();
  closeLoginModal();
}

/** Update the header auth button after auth state changes */
function updateAuthUI(user) {
  const btn  = document.getElementById('authLoginBtn');
  const pill = document.getElementById('authPill');
  if (!btn) return;

  if (user) {
    const shortEmail = user.email ? user.email.split('@')[0].slice(0,12) : '';
    btn.setAttribute('aria-label', 'Account: ' + user.email);
    btn.title = user.email;
    if (pill) {
      pill.setAttribute('data-signed-in', '1');
      pill.textContent = shortEmail || '●';
    }
  } else {
    btn.setAttribute('aria-label', t('auth_login') || 'Sign in');
    btn.title = '';
    if (pill) {
      pill.removeAttribute('data-signed-in');
      pill.textContent = t('auth_login') || 'Free';
    }
  }
  applyTierUI();
}

/* ══════════════════════════════════════════════════════════════════
   ★  SECTION 3 — MARKET / PRICE LIST TAB
   ══════════════════════════════════════════════════════════════════
   Renders the Market tab: a live editable ingredient price list.
   Changing a price here triggers the Global Price Sync across all
   saved recipes (same two-pass cascade as onPriceChange).
   PRO+ only — gated via checkFeatureAccess('market_price_sync').
   ══════════════════════════════════════════════════════════════════ */

/** Active tab state: 'calculator' | 'market' */
let activeTab = 'calculator';

/** Switch between Calculator and Market tabs */
function switchTab(tab) {
  activeTab = tab;

  // All panels — hide, then show the right one
  const panels = {
    calculator:  document.getElementById('mainContent'),
    market:      document.getElementById('marketPanel'),
    'pf-library':document.getElementById('pfPanel'),
  };
  Object.entries(panels).forEach(([key, el]) => {
    if (el) el.style.display = key === tab ? '' : 'none';
  });

  // Update tab button ARIA states
  document.querySelectorAll('.nav-tab').forEach(btn => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  // Tab-specific logic
  if (tab === 'market') {
    const gate = document.getElementById('marketGate');
    if (!checkFeatureAccess('market_price_sync')) {
      if (gate) gate.style.display = 'flex';
    } else {
      if (gate) gate.style.display = 'none';
      renderMarket();
    }
  } else if (tab === 'pf-library') {
    renderPFLibrary();
    // Clear any stale search
    const search = document.getElementById('pfSearch');
    if (search) search.value = '';
  }
}

/** Category display order for the market table */
const MARKET_CATEGORY_ORDER = [
  'protein','seafood','vegetable','dairy','dessert','alcohol','oil','dry','molecular','other','pf'
];

/**
 * renderMarket()
 * Builds the full market price list with editable price fields.
 * Pulls from window.INGREDIENT_DB + price overrides + live P/F entries.
 */
async function renderMarket() {
  const container = document.getElementById('marketList');
  if (!container) return;

  container.innerHTML = '<div class="market-loading">Loading…</div>';

  const items = await fetchIngredients();   // async — Supabase-ready
  const pfEntries = buildPFEntries();       // live P/F sub-recipes

  // Merge P/F into main list
  const allItems = [
    ...items,
    ...pfEntries.map(e => ({
      name: e.name, name_ru: e.name_ru, name_ua: e.name_ua,
      category: 'pf', price_per_unit: e._pricePerKg,
      effectivePrice: e._pricePerKg, unit: 'kg',
      waste_pct: 0, supplier: 'P/F', _isPF: true,
    })),
  ];

  // Group by category
  const groups = {};
  allItems.forEach(item => {
    const cat = item.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });

  const nk = currentLang === 'en' ? 'name' : ('name_' + currentLang);
  const s  = sym();
  const catColors = window.DB_CATEGORY_COLORS || {};
  const supColors = window.DB_SUPPLIER_COLORS || {};

  let html = '';

  MARKET_CATEGORY_ORDER.forEach(cat => {
    const group = groups[cat];
    if (!group || group.length === 0) return;
    const cc = catColors[cat] || {};
    const catLabel = cat.toUpperCase();

    html += `<div class="market-group">
      <div class="market-group-label" style="color:${cc.text||'var(--muted)'}">
        <span class="market-cat-dot" style="background:${cc.text||'var(--muted)'}"></span>
        ${catLabel}
      </div>`;

    group.forEach(item => {
      const displayName = item[nk] || item.name;
      const effectiveP  = item.effectivePrice ?? item.price_per_unit ?? 0;
      const sup         = item.supplier || '';
      const supColor    = supColors[sup] || 'rgba(100,116,139,0.8)';
      const updatedAt   = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '';
      const isPF        = item._isPF;
      const encodedName = encodeURIComponent(item.name);

      html += `<div class="market-row${isPF?' market-row-pf':''}">
        <div class="market-row-name">
          ${isPF ? '<span class="pf-tag-sm">P/F</span>' : ''}
          <span>${esc(displayName)}</span>
        </div>
        <div class="market-row-meta">
          ${sup && !isPF ? `<span class="supplier-chip" style="color:${supColor};border-color:${supColor}30;background:${supColor}12">${esc(sup)}</span>` : ''}
          <span class="market-unit">${esc(item.unit||'kg')}</span>
        </div>
        ${isPF
          ? `<div class="market-price-static">${s}${effectiveP.toFixed(2)}<span class="market-price-unit">/kg</span></div>`
          : `<div class="market-price-wrap">
              <span class="market-currency">${s}</span>
              <input class="market-price-input" type="number" min="0" step="0.01"
                value="${effectiveP.toFixed(2)}"
                data-name="${encodedName}"
                data-original="${effectiveP}"
                onchange="onMarketPriceChange(this)"
                aria-label="Price for ${esc(displayName)}"/>
              ${updatedAt ? `<span class="market-updated">${updatedAt}</span>` : ''}
            </div>`
        }
      </div>`;
    });

    html += `</div>`;
  });

  container.innerHTML = html || '<p class="market-empty">No ingredients found.</p>';
}

/**
 * onMarketPriceChange(input)
 * Called when a Market price field is edited.
 * Triggers the same global price sync dialog as inline editing.
 */
async function onMarketPriceChange(input) {
  const name      = decodeURIComponent(input.dataset.name || '');
  const newPrice  = parseFloat(input.value);
  const oldPrice  = parseFloat(input.dataset.original || '0');

  if (!name || isNaN(newPrice) || Math.abs(newPrice - oldPrice) < 0.001) return;

  // Check how many recipes this affects
  const dishes = loadDB();
  const key = name.toLowerCase().trim();
  const directCount = dishes.filter(d =>
    (d.ingredients||[]).some(i => i.name.toLowerCase().trim() === key)
  ).length;
  const pfAffected = dishes.filter(d =>
    d.isPF && (d.ingredients||[]).some(i => i.name.toLowerCase().trim() === key)
  );
  const pfNames = new Set(pfAffected.map(d => d.name.toLowerCase().trim()));
  const cascadeCount = dishes.filter(d =>
    !d.isPF && (d.ingredients||[]).some(i => pfNames.has(i.name.toLowerCase().trim()))
  ).length;

  // Update original value optimistically
  input.dataset.original = String(newPrice);

  // Use the sync dialog — fake the pending state
  _priceSyncPending = {
    id: '_market_', name, oldPrice, newPrice, key,
    affectedCount: directCount + cascadeCount,
    pfCount: pfAffected.length,
    cascadeCount,
  };
  openPriceSyncDialog(_priceSyncPending);
}

/** After price sync, refresh market price list */
const _origClosePriceSync = window._patchedClosePriceSync || null;
// Patch: after closePriceSync saves, re-render market if open
function _patchedMarketRefresh() {
  if (activeTab === 'market') {
    setTimeout(renderMarket, 150);
  }
}


/** Filter market list rows by search query */
function filterMarket(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.market-row').forEach(row => {
    const name = row.querySelector('.market-row-name')?.textContent.toLowerCase() || '';
    row.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
  // Hide empty group headers
  document.querySelectorAll('.market-group').forEach(group => {
    const visibleRows = [...group.querySelectorAll('.market-row')].filter(r => r.style.display !== 'none');
    group.style.display = visibleRows.length ? '' : 'none';
  });
}

/** Apply all dirty prices in market panel at once */
function saveAllMarketPrices() {
  const inputs = document.querySelectorAll('.market-price-input.changed');
  if (!inputs.length) { showToast('No changes to save.', ''); return; }
  inputs.forEach(input => {
    const name     = decodeURIComponent(input.dataset.name || '');
    const oldPrice = parseFloat(input.dataset.original || '0');
    const newPrice = parseFloat(input.value);
    if (name && !isNaN(newPrice) && Math.abs(newPrice - oldPrice) > 0.001) {
      _priceSyncPending = {
        id: '_market_batch_',
        name, oldPrice, newPrice,
        key: name.toLowerCase().trim(),
        affectedCount: 0,
        pfCount: 0,
        cascadeCount: 0,
      };
      // Apply directly without dialog
      closePriceSync(true);
    }
  });
  setTimeout(renderMarket, 200);
  document.getElementById('marketSaveBtn').style.display = 'none';
}

/* ══════════════════════════════════════════════════════════════════
   ★  P/F LIBRARY  — Full CRUD, Stats, Rendering
   ══════════════════════════════════════════════════════════════════
   DEFAULT SUPPLIER for all P/F items: 'In-house / Власне виробництво'
   ══════════════════════════════════════════════════════════════════ */

const PF_DEFAULT_SUPPLIER = 'In-house / Власне виробництво';

/* ─────────────────────────────────────────────────────────────
   renderPFLibrary()
   Build the full P/F card grid from localStorage.
   ───────────────────────────────────────────────────────────── */
function renderPFLibrary() {
  const allDishes = loadDB();
  const pfDishes  = allDishes.filter(d => d.isPF && d.name);

  const grid    = document.getElementById('pfCardGrid');
  const empty   = document.getElementById('pfEmptyState');
  const statCount = document.getElementById('pfStatCount');
  const statAvg   = document.getElementById('pfStatAvgCost');
  const statUsed  = document.getElementById('pfStatUsed');
  const tabBadge  = document.getElementById('pfTabCount');

  // Tab badge
  if (tabBadge) {
    tabBadge.textContent = pfDishes.length;
    tabBadge.style.display = pfDishes.length > 0 ? 'inline-block' : 'none';
  }

  if (!pfDishes.length) {
    if (grid)  grid.innerHTML  = '';
    if (empty) empty.style.display = 'block';
    if (statCount) statCount.textContent = '0';
    if (statAvg)   statAvg.textContent   = '—';
    if (statUsed)  statUsed.textContent  = '0';
    return;
  }

  if (empty) empty.style.display = 'none';

  // ── Stats ──────────────────────────────────────────────────
  const costs = pfDishes.map(d => calcPFCostPerKg(d));
  const avgCost = costs.reduce((a,b) => a+b, 0) / costs.length;

  // Count how many non-PF recipes use at least one P/F
  const pfNames = new Set(pfDishes.map(d => d.name.toLowerCase().trim()));
  const usedInCount = allDishes.filter(d =>
    !d.isPF && (d.ingredients||[]).some(i => pfNames.has((i.name||'').toLowerCase().trim()))
  ).length;

  if (statCount) statCount.textContent = pfDishes.length;
  if (statAvg)   statAvg.textContent   = fmt(avgCost) + '/kg';
  if (statUsed)  statUsed.textContent  = usedInCount;

  // ── Cards ──────────────────────────────────────────────────
  const s  = sym();
  const catMap = {
    starter:t('cat_starter'), main:t('cat_main'),
    dessert:t('cat_dessert'), drink:t('cat_drink'), other:t('cat_other'),
  };

  if (grid) {
    grid.innerHTML = pfDishes.map((d, localIdx) => {
      const globalIdx = allDishes.indexOf(d);
      const costPerKg = calcPFCostPerKg(d);
      const yieldG    = parseFloat(d.output) || 1000;
      const ingCount  = (d.ingredients||[]).length;
      const date      = d.savedAt ? new Date(d.savedAt).toLocaleDateString() : '';
      const supplier  = d.supplier || PF_DEFAULT_SUPPLIER;

      // How many recipes reference this P/F
      const pfKey = d.name.toLowerCase().trim();
      const linkedCount = allDishes.filter(dd =>
        !dd.isPF && (dd.ingredients||[]).some(i => (i.name||'').toLowerCase().trim() === pfKey)
      ).length;

      // Ingredient preview (up to 4 items)
      const previewIng = (d.ingredients||[]).slice(0,4);
      const ingPreviewHtml = previewIng.map(ing => {
        const unitPrice = parseFloat(ing.price) || 0;
        const cost = calcIngCost(unitPrice, parseFloat(ing.amount)||0, ing.unit||'g', parseFloat(ing.waste)||0);
        return `<div class="pf-ing-preview-item">
          <span class="pf-ing-name">${esc(ing.name||'—')}</span>
          <span class="pf-ing-cost">${cost>0?fmt(cost):'—'}</span>
        </div>`;
      }).join('');

      const moreCount = (d.ingredients||[]).length - previewIng.length;
      const moreHtml = moreCount > 0
        ? `<div style="font-size:.72rem;color:var(--muted);padding-top:2px">+${moreCount} more…</div>`
        : '';

      return `<div class="pf-card" role="listitem" data-pf-name="${esc(d.name)}" id="pfCard-${globalIdx}">
        <div class="pf-card-header">
          <div class="pf-card-title">
            <span class="pf-card-badge">P/F</span>
            <span title="${esc(d.name)}">${esc(d.name)}</span>
          </div>
          <div class="pf-card-actions">
            <button class="pf-action-btn edit"
              onclick="editPF(${globalIdx})"
              aria-label="Edit ${esc(d.name)}" title="${t('btn_edit_pf')||'Edit'}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="pf-action-btn del"
              onclick="deletePF(${globalIdx})"
              aria-label="Delete ${esc(d.name)}" title="${t('msg_deleted')||'Delete'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="pf-card-metrics">
          <div class="pf-metric">
            <div class="pf-metric-label">${t('pf_cost_per_kg')||'Cost/kg'}</div>
            <div class="pf-metric-value gold">${s}${costPerKg.toFixed(2)}</div>
          </div>
          <div class="pf-metric">
            <div class="pf-metric-label">${t('label_output')||'Yield'}</div>
            <div class="pf-metric-value">${yieldG}g</div>
          </div>
          <div class="pf-metric">
            <div class="pf-metric-label">${t('pf_used_in')||'Used in'}</div>
            <div class="pf-metric-value">${linkedCount} ${t('pf_recipes')||'recipes'}</div>
          </div>
        </div>

        <!-- Ingredient preview -->
        <div class="pf-ing-preview">${ingPreviewHtml}${moreHtml}</div>

        <!-- Footer: supplier + date -->
        <div class="pf-card-footer">
          <span class="pf-supplier-chip">${esc(supplier)}</span>
          <span class="pf-date">${date}</span>
        </div>
      </div>`;
    }).join('');
  }
}

/* ─────────────────────────────────────────────────────────────
   filterPFLibrary(query)  — client-side search
   ───────────────────────────────────────────────────────────── */
function filterPFLibrary(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.pf-card').forEach(card => {
    const name = (card.dataset.pfName || '').toLowerCase();
    const ingText = card.querySelector('.pf-ing-preview')?.textContent.toLowerCase() || '';
    card.style.display = (!q || name.includes(q) || ingText.includes(q)) ? '' : 'none';
  });
}

/* ─────────────────────────────────────────────────────────────
   createNewPF()  — switches to calculator with P/F pre-checked
   ───────────────────────────────────────────────────────────── */
function createNewPF() {
  switchTab('calculator');
  // Pre-check the P/F toggle
  const pfCheck = document.getElementById('isPF');
  if (pfCheck) { pfCheck.checked = true; togglePF(); }
  // Clear form for fresh entry
  const dishName = document.getElementById('dishName');
  if (dishName) { dishName.value = ''; dishName.focus(); }
  showToast(t('toast_pf_create') || '⭐ P/F mode active — fill in your sub-recipe', 'gold');
}

/* ─────────────────────────────────────────────────────────────
   editPF(index)  — loads the P/F into the calculator
   ───────────────────────────────────────────────────────────── */
function editPF(index) {
  loadDish(index);               // loads into calculator
  switchTab('calculator');
  // Ensure P/F toggle is on
  setTimeout(() => {
    const pfCheck = document.getElementById('isPF');
    if (pfCheck && !pfCheck.checked) { pfCheck.checked = true; togglePF(); }
  }, 50);
  showToast(t('toast_pf_edit') || '✏️ Editing P/F — save when done', 'gold');
}

/* ─────────────────────────────────────────────────────────────
   deletePF(index)  — removes P/F from storage
   ───────────────────────────────────────────────────────────── */
function deletePF(index) {
  const dishes = loadDB();
  const dish   = dishes[index];
  if (!dish) return;

  // Warn if this P/F is used in other recipes
  const pfKey = dish.name.toLowerCase().trim();
  const linkedCount = dishes.filter(d =>
    !d.isPF && (d.ingredients||[]).some(i => (i.name||'').toLowerCase().trim() === pfKey)
  ).length;

  const confirmMsg = linkedCount > 0
    ? `Delete "${dish.name}"? It is used in ${linkedCount} recipe(s). Those recipes will still keep the stored price but will no longer update automatically.`
    : `Delete "${dish.name}"?`;

  if (!confirm(confirmMsg)) return;

  dishes.splice(index, 1);
  saveDB(dishes);
  renderSaved();
  renderPFLibrary();
  showToast(t('msg_deleted'), '');
}

/* ─────────────────────────────────────────────────────────────
   saveDish override: auto-set supplier to PF_DEFAULT_SUPPLIER
   when isPF is true and no supplier explicitly set
   ───────────────────────────────────────────────────────────── */
function applyPFDefaults(data) {
  if (!data.isPF) return data;
  if (!data.supplier) data.supplier = PF_DEFAULT_SUPPLIER;
  return data;
}

/* ══════════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  let saved='en';
  try{saved=localStorage.getItem('dl_lang')||'en'}catch(e){}
  if(!TRANSLATIONS[saved])saved='en';

  // Waitlist form state restore
  if(getWaitlistEmail()){
    const form=document.getElementById('waitlistForm');
    const success=document.getElementById('waitlistSuccess');
    if(form&&success){/* shown when modal opens */}
  }

  document.querySelectorAll('.lb').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
  document.getElementById('markupSlider')?.addEventListener('input',function(){onMarkupSlide(this.value)});

  addIngredient();addIngredient();
  initVoice();
  restoreAuthSession();  // restore login state from localStorage / Supabase
  setLang(saved);
  applyTierUI();         // apply tier visuals after lang sets string tokens

  // ESC closes modals
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      closeProModal();
      closePriceSync(false);
      closeLoginModal();
      if(chatOpen)toggleChat();
    }
  });

  // ── Virtual keyboard / viewport resize handler ────────────────────────
  // When mobile keyboard opens, window.visualViewport shrinks.
  // We reposition the chat window so the input row stays visible.
  if (window.visualViewport) {
    const repositionChat = () => {
      const win = document.getElementById('aiChatWindow');
      if (!win || !chatOpen) return;

      const vvHeight  = window.visualViewport.height;   // visible height with keyboard
      const vvOffset  = window.visualViewport.offsetTop; // scroll offset
      const fabHeight = 56 + 12;    // FAB (56px) + gap (12px)
      const safeArea  = parseInt(getComputedStyle(document.documentElement)
                          .getPropertyValue('--safe-bottom') || '0') || 0;

      // Position window above FAB within visual viewport
      const newBottom = vvHeight < window.innerHeight
        ? window.innerHeight - vvHeight - vvOffset + fabHeight  // keyboard open
        : null;  // keyboard closed — let CSS handle it

      if (newBottom !== null) {
        win.style.bottom = newBottom + 'px';
        // Shrink max-height so input row is never off-screen
        const available = vvHeight - fabHeight - 24;
        win.style.maxHeight = Math.max(200, available) + 'px';
      } else {
        win.style.bottom = '';
        win.style.maxHeight = '';
      }
    };

    window.visualViewport.addEventListener('resize',  repositionChat);
    window.visualViewport.addEventListener('scroll',  repositionChat);
  }

  // Outside click
  document.addEventListener('click',e=>{
    const win=document.getElementById('aiChatWindow');
    const btn=document.getElementById('aiFloatBtn');
    if(chatOpen&&win&&btn&&!win.contains(e.target)&&!btn.contains(e.target)){
      chatOpen=false;win.classList.remove('visible');btn.classList.remove('open');
      win.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');
    }
    const menu=document.getElementById('mobMenu');
    const ham=document.getElementById('mobHam');
    if(menu?.classList.contains('open')&&!menu.contains(e.target)&&!ham?.contains(e.target)){
      menu.classList.remove('open');ham?.setAttribute('aria-expanded','false');
    }
  });
});