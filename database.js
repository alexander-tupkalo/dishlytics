/* ═══════════════════════════════════════════════════════════════════
   DISHLYTICS  •  database.js  v3  (70+ ingredients)
   ─────────────────────────────────────────────────────────────────
   Prices in UAH (average wholesale, Kyiv region, 2024-25).
   Adjust price_per_unit to your local supplier invoices.

   Schema:
   {
     name          – EN display name (autocomplete key)
     name_ru       – RU
     name_ua       – UA
     category      – see CATEGORIES below
     price_per_unit – UAH per 1 kg or 1 L
     unit          – 'kg' | 'l'
     waste_pct     – professional kitchen waste %
     supplier      – main supplier name
     note          – kitchen context / tip
   }

   CATEGORIES:
     protein  · seafood  · vegetable  · dairy
     dessert  · alcohol  · oil        · dry
     molecular · other
   ═══════════════════════════════════════════════════════════════════ */

window.INGREDIENT_DB = [

  /* ═══════════════════════ SEAFOOD ════════════════════════════ */
  {
    name:'Octopus (whole, fresh)',
    name_ru:'Осьминог (целый, свежий)',
    name_ua:'Восьминіг (цілий, свіжий)',
    category:'seafood',
    price_per_unit:1200,unit:'kg',waste_pct:60,
    supplier:'МЕТРО',
    note:'Raw octopus shrinks ~60% during boiling. Always buy by raw weight.',
  },
  {
    name:'Octopus tentacles (boiled)',
    name_ru:'Щупальца осьминога (варёные)',
    name_ua:'Щупальця восьминога (варені)',
    category:'seafood',
    price_per_unit:2200,unit:'kg',waste_pct:10,
    supplier:'МЕТРО',
    note:'Pre-boiled. Minimal trim. Char on grill before plating.',
  },
  {
    name:'Squid (whole, fresh)',
    name_ru:'Кальмар (целый, свежий)',
    name_ua:'Кальмар (цілий, свіжий)',
    category:'seafood',
    price_per_unit:350,unit:'kg',waste_pct:35,
    supplier:'МЕТРО',
    note:'Head, quill, skin and boiling shrinkage: ~35% combined.',
  },
  {
    name:'Sea bass (whole)',
    name_ru:'Морской окунь (целый)',
    name_ua:'Морський окунь (цілий)',
    category:'seafood',
    price_per_unit:380,unit:'kg',waste_pct:45,
    supplier:'МЕТРО',
    note:'Head, bones, skin: ~45%. Always calculate from whole fish weight.',
  },
  {
    name:'Salmon fillet (skin-on)',
    name_ru:'Филе лосося (с кожей)',
    name_ua:'Філе лосося (зі шкірою)',
    category:'seafood',
    price_per_unit:720,unit:'kg',waste_pct:12,
    supplier:'МЕТРО',
    note:'Skin and pin bone trim: ~12%.',
  },
  {
    name:'Shrimp (raw, shell-on)',
    name_ru:'Креветки (сырые, в панцире)',
    name_ua:'Креветки (сирі, в панцирі)',
    category:'seafood',
    price_per_unit:350,unit:'kg',waste_pct:35,
    supplier:'МЕТРО',
    note:'Shell and head removal: ~35%.',
  },
  {
    name:'Sea scallops',
    name_ru:'Морские гребешки',
    name_ua:'Морські гребінці',
    category:'seafood',
    price_per_unit:1400,unit:'kg',waste_pct:15,
    supplier:'МЕТРО',
    note:'Coral (roe) trim: ~15%.',
  },

  /* ═══════════════════════ PROTEINS ════════════════════════════ */
  {
    name:'Chicken breast',
    name_ru:'Куриное филе (грудка)',
    name_ua:'Куряче філе (грудка)',
    category:'protein',
    price_per_unit:155,unit:'kg',waste_pct:8,
    supplier:'MHP',
    note:'Fat and cartilage trim: ~8%.',
  },
  {
    name:'Chicken thigh (boneless)',
    name_ru:'Куриное бедро (без кости)',
    name_ua:'Куряче стегно (без кістки)',
    category:'protein',
    price_per_unit:130,unit:'kg',waste_pct:10,
    supplier:'MHP',
    note:'Fat and sinew trim: ~10%.',
  },
  {
    name:'Beef striploin',
    name_ru:'Говядина стриплойн',
    name_ua:'Яловичина стриплойн',
    category:'protein',
    price_per_unit:480,unit:'kg',waste_pct:18,
    supplier:'AVS-Trade',
    note:'Fat cap and side sinew: ~18%.',
  },
  {
    name:'Beef tenderloin',
    name_ru:'Говяжья вырезка',
    name_ua:'Яловича вирізка',
    category:'protein',
    price_per_unit:600,unit:'kg',waste_pct:20,
    supplier:'AVS-Trade',
    note:'Chain, silverskin, fat: ~20%.',
  },
  {
    name:'Pork belly',
    name_ru:'Свиная грудинка',
    name_ua:'Свиняча грудинка',
    category:'protein',
    price_per_unit:200,unit:'kg',waste_pct:10,
    supplier:'Fozzy',
    note:'Skin-on. Minimal trim.',
  },
  {
    name:'Duck breast',
    name_ru:'Утиная грудка',
    name_ua:'Качина грудка',
    category:'protein',
    price_per_unit:390,unit:'kg',waste_pct:15,
    supplier:'Fozzy',
    note:'Fat cap scored. Fat renders ~15% during cooking.',
  },
  {
    name:'Foie gras (duck, raw)',
    name_ru:'Фуа-гра (утиная, сырая)',
    name_ua:'Фуа-гра (качина, сира)',
    category:'protein',
    price_per_unit:5500,unit:'kg',waste_pct:20,
    supplier:'МЕТРО',
    note:'Devein and remove blood vessels: ~20%.',
  },

  /* ═══════════════════════ VEGETABLES ══════════════════════════ */
  {
    name:'Potato',
    name_ru:'Картофель',
    name_ua:'Картопля',
    category:'vegetable',
    price_per_unit:18,unit:'kg',waste_pct:20,
    supplier:'Fozzy',
    note:'Peeling: ~20%.',
  },
  {
    name:'Onion',
    name_ru:'Лук репчатый',
    name_ua:'Цибуля ріпчаста',
    category:'vegetable',
    price_per_unit:16,unit:'kg',waste_pct:12,
    supplier:'Fozzy',
    note:'Skin and root: ~12%.',
  },
  {
    name:'Carrot',
    name_ru:'Морковь',
    name_ua:'Морква',
    category:'vegetable',
    price_per_unit:14,unit:'kg',waste_pct:15,
    supplier:'Fozzy',
    note:'Peeling and top: ~15%.',
  },
  {
    name:'Garlic',
    name_ru:'Чеснок',
    name_ua:'Часник',
    category:'vegetable',
    price_per_unit:80,unit:'kg',waste_pct:18,
    supplier:'Fozzy',
    note:'Skin and root disc: ~18%.',
  },
  {
    name:'Leek',
    name_ru:'Лук-порей',
    name_ua:'Цибуля-порей',
    category:'vegetable',
    price_per_unit:55,unit:'kg',waste_pct:30,
    supplier:'Fozzy',
    note:'Dark green tops and root: ~30%.',
  },
  {
    name:'Cherry tomatoes',
    name_ru:'Помидоры черри',
    name_ua:'Помідори черрі',
    category:'vegetable',
    price_per_unit:90,unit:'kg',waste_pct:5,
    supplier:'Fozzy',
    note:'Damaged fruit only: ~5%.',
  },
  {
    name:'Bell pepper',
    name_ru:'Болгарский перец',
    name_ua:'Болгарський перець',
    category:'vegetable',
    price_per_unit:65,unit:'kg',waste_pct:20,
    supplier:'Fozzy',
    note:'Core, seeds, membrane: ~20%.',
  },
  {
    name:'Spinach (fresh)',
    name_ru:'Шпинат (свежий)',
    name_ua:'Шпинат (свіжий)',
    category:'vegetable',
    price_per_unit:120,unit:'kg',waste_pct:30,
    supplier:'Fozzy',
    note:'Stems and wilted leaves: ~30%.',
  },
  {
    name:'Mushrooms (champignon)',
    name_ru:'Шампиньоны',
    name_ua:'Шампіньйони',
    category:'vegetable',
    price_per_unit:75,unit:'kg',waste_pct:12,
    supplier:'Fozzy',
    note:'Stem trim: ~12%.',
  },
  {
    name:'Asparagus',
    name_ru:'Спаржа',
    name_ua:'Спаржа',
    category:'vegetable',
    price_per_unit:220,unit:'kg',waste_pct:25,
    supplier:'МЕТРО',
    note:'Woody ends: ~25%.',
  },

  /* ═══════════════════════ DAIRY ══════════════════════════════ */
  {
    name:'Butter (unsalted)',
    name_ru:'Масло сливочное (несолёное)',
    name_ua:'Масло вершкове (несолоне)',
    category:'dairy',
    price_per_unit:280,unit:'kg',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste.',
  },
  {
    name:'Heavy cream 33%',
    name_ru:'Сливки 33%',
    name_ua:'Вершки 33%',
    category:'dairy',
    price_per_unit:160,unit:'l',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste.',
  },
  {
    name:'Parmesan (Parmigiano)',
    name_ru:'Пармезан',
    name_ua:'Пармезан',
    category:'dairy',
    price_per_unit:840,unit:'kg',waste_pct:5,
    supplier:'МЕТРО',
    note:'Rind trim: ~5%.',
  },
  {
    name:'Mascarpone',
    name_ru:'Маскарпоне',
    name_ua:'Маскарпоне',
    category:'dairy',
    price_per_unit:420,unit:'kg',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste. Use entire container. Core ingredient in Tiramisu.',
  },
  {
    name:'Mozzarella (fresh)',
    name_ru:'Моцарелла (свежая)',
    name_ua:'Моцарела (свіжа)',
    category:'dairy',
    price_per_unit:380,unit:'kg',waste_pct:10,
    supplier:'Fozzy',
    note:'Brine/water weight: ~10%.',
  },
  {
    name:'Cream cheese',
    name_ru:'Сливочный сыр',
    name_ua:'Вершковий сир',
    category:'dairy',
    price_per_unit:350,unit:'kg',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste.',
  },
  {
    name:'Greek yoghurt',
    name_ru:'Йогурт греческий',
    name_ua:'Грецький йогурт',
    category:'dairy',
    price_per_unit:180,unit:'kg',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste.',
  },
  {
    name:'Milk (whole)',
    name_ru:'Молоко цельное',
    name_ua:'Молоко незбиране',
    category:'dairy',
    price_per_unit:38,unit:'l',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste.',
  },

  /* ════════════════════ DESSERT ESSENTIALS ═════════════════════ */
  {
    name:'Flour (all-purpose)',
    name_ru:'Мука пшеничная',
    name_ua:'Борошно пшеничне',
    category:'dessert',
    price_per_unit:18,unit:'kg',waste_pct:2,
    supplier:'Київхліб',
    note:'Dusting loss: ~2%. Sift before weighing for accurate recipes.',
  },
  {
    name:'Sugar (white, fine)',
    name_ru:'Сахар белый (мелкий)',
    name_ua:'Цукор білий (дрібний)',
    category:'dessert',
    price_per_unit:28,unit:'kg',waste_pct:1,
    supplier:'Fozzy',
    note:'Negligible loss: ~1%. Weigh precisely for pastry.',
  },
  {
    name:'Sugar (caster)',
    name_ru:'Сахар касторовый',
    name_ua:'Цукор кастерний',
    category:'dessert',
    price_per_unit:35,unit:'kg',waste_pct:1,
    supplier:'МЕТРО',
    note:'Finer grain — dissolves faster in meringue and sauces.',
  },
  {
    name:'Callebaut Dark Chocolate 70%',
    name_ru:'Шоколад тёмный Callebaut 70%',
    name_ua:'Шоколад чорний Callebaut 70%',
    category:'dessert',
    price_per_unit:680,unit:'kg',waste_pct:3,
    supplier:'МЕТРО',
    note:'Professional couverture. Temper before use. ~3% shaving loss. Enter amount in grams.',
  },
  {
    name:'Callebaut White Chocolate',
    name_ru:'Шоколад белый Callebaut',
    name_ua:'Шоколад білий Callebaut',
    category:'dessert',
    price_per_unit:720,unit:'kg',waste_pct:3,
    supplier:'МЕТРО',
    note:'Professional couverture. Burns easily — max 40°C. Enter amount in grams.',
  },
  {
    name:'Callebaut Milk Chocolate',
    name_ru:'Шоколад молочный Callebaut',
    name_ua:'Шоколад молочний Callebaut',
    category:'dessert',
    price_per_unit:700,unit:'kg',waste_pct:3,
    supplier:'МЕТРО',
    note:'Professional couverture. Enter amount in grams.',
  },
  {
    name:'Cocoa powder (natural)',
    name_ru:'Какао-порошок (натуральный)',
    name_ua:'Какао-порошок (натуральний)',
    category:'dessert',
    price_per_unit:240,unit:'kg',waste_pct:2,
    supplier:'МЕТРО',
    note:'Dust loss ~2%. Sift to prevent lumps.',
  },
  {
    name:'Vanilla extract (pure)',
    name_ru:'Ванильный экстракт (натуральный)',
    name_ua:'Ванільний екстракт (натуральний)',
    category:'dessert',
    price_per_unit:8500,unit:'l',waste_pct:0,
    supplier:'МЕТРО',
    note:'Used in ml — enter 3–15ml per recipe. No waste. Bottle: ~100ml ≈ ₴850.',
  },
  {
    name:'Vanilla pod',
    name_ru:'Стручок ванили',
    name_ua:'Стручок ванілі',
    category:'dessert',
    price_per_unit:42000,unit:'kg',waste_pct:10,
    supplier:'МЕТРО',
    note:'Each pod ~3g. Price ~₴126/pod. Split pod = ~10% loss (ends). Enter grams.',
  },
  {
    name:'Gelatin (sheets, silver)',
    name_ru:'Желатин (листовой, серебряный)',
    name_ua:'Желатин (листовий, срібний)',
    category:'dessert',
    price_per_unit:2200,unit:'kg',waste_pct:0,
    supplier:'МЕТРО',
    note:'1 sheet ≈ 2g / ~₴4.4. Bloom in cold water before use. Enter grams.',
  },
  {
    name:'Gelatin (powder)',
    name_ru:'Желатин (порошок)',
    name_ua:'Желатин (порошок)',
    category:'dessert',
    price_per_unit:1800,unit:'kg',waste_pct:0,
    supplier:'Fozzy',
    note:'1 tsp ≈ 4g. Dissolve 1:5 in cold water. Enter grams.',
  },
  {
    name:'Berries (frozen mixed)',
    name_ru:'Ягоды (замороженные, микс)',
    name_ua:'Ягоди (заморожені, мікс)',
    category:'dessert',
    price_per_unit:95,unit:'kg',waste_pct:8,
    supplier:'Fozzy',
    note:'Defrost weight loss ~8%. Excess liquid removed before use.',
  },
  {
    name:'Strawberries (fresh)',
    name_ru:'Клубника (свежая)',
    name_ua:'Полуниця (свіжа)',
    category:'dessert',
    price_per_unit:180,unit:'kg',waste_pct:12,
    supplier:'Fozzy',
    note:'Hull and soft spots: ~12%.',
  },
  {
    name:'Raspberries (fresh)',
    name_ru:'Малина (свежая)',
    name_ua:'Малина (свіжа)',
    category:'dessert',
    price_per_unit:320,unit:'kg',waste_pct:10,
    supplier:'Fozzy',
    note:'Sorting spoiled fruit: ~10%.',
  },
  {
    name:'Blueberries (fresh)',
    name_ru:'Черника (свежая)',
    name_ua:'Чорниця (свіжа)',
    category:'dessert',
    price_per_unit:260,unit:'kg',waste_pct:5,
    supplier:'Fozzy',
    note:'Minimal — only damaged berries: ~5%.',
  },
  {
    name:'Eggs (10-pack)',
    name_ru:'Яйца (10 шт)',
    name_ua:'Яйця (10 шт)',
    category:'dessert',
    price_per_unit:65,unit:'kg',waste_pct:12,
    supplier:'MHP',
    note:'Shell weight ~12%. Price per kg of shelled content.',
  },
  {
    name:'Almond flour',
    name_ru:'Миндальная мука',
    name_ua:'Мигдальне борошно',
    category:'dessert',
    price_per_unit:480,unit:'kg',waste_pct:2,
    supplier:'МЕТРО',
    note:'Fine-ground blanched almonds. Core ingredient for macarons, financiers.',
  },
  {
    name:'Powdered sugar (icing)',
    name_ru:'Сахарная пудра',
    name_ua:'Цукрова пудра',
    category:'dessert',
    price_per_unit:42,unit:'kg',waste_pct:3,
    supplier:'Fozzy',
    note:'Sifting loss ~3%. Always sift with cocoa or almond flour.',
  },
  {
    name:'Corn starch',
    name_ru:'Кукурузный крахмал',
    name_ua:'Кукурудзяний крохмаль',
    category:'dessert',
    price_per_unit:55,unit:'kg',waste_pct:1,
    supplier:'Fozzy',
    note:'Thickening agent. Enter in grams (typically 5–30g per recipe).',
  },
  {
    name:'Baking powder',
    name_ru:'Разрыхлитель',
    name_ua:'Розпушувач',
    category:'dessert',
    price_per_unit:180,unit:'kg',waste_pct:0,
    supplier:'Fozzy',
    note:'Used 5–15g per recipe. No waste.',
  },

  /* ════════════════════ BAR & KITCHEN ALCOHOL ══════════════════ */
  {
    name:'Brandy (cooking)',
    name_ru:'Бренди (для готовки)',
    name_ua:'Бренді (для готування)',
    category:'alcohol',
    price_per_unit:320,unit:'l',waste_pct:0,
    supplier:'Badagoni',
    note:'Flambé or deglaze. Alcohol evaporates fully on ignition.',
  },
  {
    name:'Dark rum',
    name_ru:'Тёмный ром',
    name_ua:'Темний ром',
    category:'alcohol',
    price_per_unit:420,unit:'l',waste_pct:0,
    supplier:'Badagoni',
    note:'Desserts, marinades. Classic in Tiramisu and Rum Baba.',
  },
  {
    name:'Calvados (apple brandy)',
    name_ru:'Кальвадос (яблочный бренди)',
    name_ua:'Кальвадос (яблучний бренді)',
    category:'alcohol',
    price_per_unit:680,unit:'l',waste_pct:0,
    supplier:'Badagoni',
    note:'Apple-forward. Use in pan sauces with pork or duck.',
  },
  {
    name:'Dry red wine (cooking)',
    name_ru:'Сухое красное вино (для готовки)',
    name_ua:'Сухе червоне вино (для готування)',
    category:'alcohol',
    price_per_unit:180,unit:'l',waste_pct:0,
    supplier:'Badagoni',
    note:'Reduction sauces, braises. Alcohol evaporates during cooking.',
  },
  {
    name:'Dry white wine (cooking)',
    name_ru:'Сухое белое вино (для готовки)',
    name_ua:'Сухе біле вино (для готування)',
    category:'alcohol',
    price_per_unit:175,unit:'l',waste_pct:0,
    supplier:'Badagoni',
    note:'Risotto, white sauces, seafood. Use low-acid variety.',
  },
  {
    name:'Cooking sherry (dry)',
    name_ru:'Херес (сухой, для готовки)',
    name_ua:'Херес (сухий, для готування)',
    category:'alcohol',
    price_per_unit:220,unit:'l',waste_pct:0,
    supplier:'Badagoni',
    note:'Soups, sauces, consommé. Concentrated umami flavour.',
  },
  {
    name:'Marsala (dry)',
    name_ru:'Марсала (сухая)',
    name_ua:'Марсала (суха)',
    category:'alcohol',
    price_per_unit:280,unit:'l',waste_pct:0,
    supplier:'Badagoni',
    note:'Scaloppine, Zabaione. Adds nutty depth.',
  },

  /* ════════════════════ OILS & FATS ════════════════════════════ */
  {
    name:'Olive oil (extra virgin)',
    name_ru:'Оливковое масло (экстра вёрджин)',
    name_ua:'Оливкова олія (екстра верджин)',
    category:'oil',
    price_per_unit:420,unit:'l',waste_pct:0,
    supplier:'МЕТРО',
    note:'No waste.',
  },
  {
    name:'Sunflower oil (refined)',
    name_ru:'Подсолнечное масло (рафинированное)',
    name_ua:'Соняшникова олія (рафінована)',
    category:'oil',
    price_per_unit:58,unit:'l',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste.',
  },
  {
    name:'Truffle oil (black)',
    name_ru:'Трюфельное масло (чёрное)',
    name_ua:'Трюфельна олія (чорна)',
    category:'oil',
    price_per_unit:1200,unit:'l',waste_pct:0,
    supplier:'МЕТРО',
    note:'Finishing oil — 3–5 ml per plate.',
  },

  /* ════════════════════ DRY GOODS ══════════════════════════════ */
  {
    name:'Arborio rice',
    name_ru:'Рис арборио',
    name_ua:'Рис арборіо',
    category:'dry',
    price_per_unit:95,unit:'kg',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste. Volume doubles on cooking.',
  },
  {
    name:'Pasta (spaghetti)',
    name_ru:'Паста (спагетти)',
    name_ua:'Паста (спагеті)',
    category:'dry',
    price_per_unit:55,unit:'kg',waste_pct:0,
    supplier:'Fozzy',
    note:'No waste. Weight doubles when cooked.',
  },
  {
    name:'Pine nuts',
    name_ru:'Кедровые орехи',
    name_ua:'Кедрові горіхи',
    category:'dry',
    price_per_unit:1800,unit:'kg',waste_pct:2,
    supplier:'МЕТРО',
    note:'Pre-shelled. Minimal loss.',
  },
  {
    name:'Chicken stock',
    name_ru:'Куриный бульон',
    name_ua:'Курячий бульйон',
    category:'dry',
    price_per_unit:45,unit:'l',waste_pct:0,
    supplier:'Fozzy',
    note:'Pre-made. Reduction counted in recipe yield.',
  },
  {
    name:'Soy sauce',
    name_ru:'Соевый соус',
    name_ua:'Соєвий соус',
    category:'dry',
    price_per_unit:140,unit:'l',waste_pct:0,
    supplier:'МЕТРО',
    note:'No waste.',
  },
  {
    name:'Fresh thyme',
    name_ru:'Тимьян свежий',
    name_ua:'Чебрець свіжий',
    category:'dry',
    price_per_unit:350,unit:'kg',waste_pct:20,
    supplier:'Fozzy',
    note:'Stems removed, leaves only: ~20%.',
  },
  {
    name:'Fresh basil',
    name_ru:'Базилик свежий',
    name_ua:'Базилік свіжий',
    category:'dry',
    price_per_unit:400,unit:'kg',waste_pct:25,
    supplier:'Fozzy',
    note:'Thick stems removed: ~25%.',
  },
  {
    name:'Lemon',
    name_ru:'Лимон',
    name_ua:'Лимон',
    category:'dry',
    price_per_unit:60,unit:'kg',waste_pct:30,
    supplier:'Fozzy',
    note:'Zest and juice only: ~30% pith waste.',
  },

  /* ════════════════════ PREMIUM / HIGH-VALUE ═══════════════════ */
  {
    name:'Truffle paste (black)',
    name_ru:'Трюфельная паста (чёрная)',
    name_ua:'Трюфельна паста (чорна)',
    category:'other',
    price_per_unit:3000,unit:'kg',waste_pct:0,
    supplier:'МЕТРО',
    note:'Sold in 500g jars (≈₴1500). Price per kg. Use 5–15g per portion.',
  },
  {
    name:'Saffron (threads)',
    name_ru:'Шафран (нити)',
    name_ua:'Шафран (нитки)',
    category:'dry',
    price_per_unit:250000,unit:'kg',waste_pct:0,
    supplier:'МЕТРО',
    note:'⚠ ₴250/g → ₴250,000/kg. Enter amount in grams (0.1–0.5g per dish).',
  },
  {
    name:'Caviar (black, sturgeon)',
    name_ru:'Икра (чёрная, осётровая)',
    name_ua:'Ікра (чорна, осетрова)',
    category:'seafood',
    price_per_unit:120000,unit:'kg',waste_pct:0,
    supplier:'МЕТРО',
    note:'Enter amount in grams. No waste.',
  },

  /* ════════════════════ MOLECULAR ══════════════════════════════ */
  {
    name:'Agar-agar',
    name_ru:'Агар-агар',
    name_ua:'Агар-агар',
    category:'molecular',
    price_per_unit:2800,unit:'kg',waste_pct:0,
    supplier:'AVS-Trade',
    note:'⚠ Micro-doses: 2–8g per litre. Sets at room temperature. Enter grams.',
  },
  {
    name:'Xanthan gum',
    name_ru:'Ксантановая камедь',
    name_ua:'Ксантанова камедь',
    category:'molecular',
    price_per_unit:3500,unit:'kg',waste_pct:0,
    supplier:'AVS-Trade',
    note:'⚠ Micro-doses: 1–5g per litre. Cold-soluble. Enter grams.',
  },
  {
    name:'Lecithin (soy)',
    name_ru:'Лецитин (соевый)',
    name_ua:'Лецитин (соєвий)',
    category:'molecular',
    price_per_unit:1800,unit:'kg',waste_pct:0,
    supplier:'AVS-Trade',
    note:'⚠ Micro-doses: 3–6g per litre for foam/air. Enter grams.',
  },
  {
    name:'Sodium alginate',
    name_ru:'Альгинат натрия',
    name_ua:'Альгінат натрію',
    category:'molecular',
    price_per_unit:3200,unit:'kg',waste_pct:0,
    supplier:'AVS-Trade',
    note:'⚠ Micro-doses: 3–5g per 500ml. Used for spherification. Enter grams.',
  },
];

/* ──────────────────────────────────────────────────────────────
   CATEGORY COLOR MAP  (used in autocomplete badge + supplier chip)
   ────────────────────────────────────────────────────────────── */
window.DB_CATEGORY_COLORS = {
  seafood:   { bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.3)',  text:'#38bdf8' },
  protein:   { bg:'rgba(239,68,68,0.10)',   border:'rgba(239,68,68,0.28)',  text:'#f87171' },
  vegetable: { bg:'rgba(74,222,128,0.10)',  border:'rgba(74,222,128,0.28)', text:'#4ade80' },
  dairy:     { bg:'rgba(250,204,21,0.10)',  border:'rgba(250,204,21,0.28)', text:'#fbbf24' },
  dessert:   { bg:'rgba(232,121,249,0.10)', border:'rgba(232,121,249,0.28)',text:'#e879f9' },
  alcohol:   { bg:'rgba(251,146,60,0.10)',  border:'rgba(251,146,60,0.28)', text:'#fb923c' },
  oil:       { bg:'rgba(234,179,8,0.10)',   border:'rgba(234,179,8,0.28)',  text:'#eab308' },
  dry:       { bg:'rgba(148,163,184,0.10)', border:'rgba(148,163,184,0.25)',text:'#94a3b8' },
  molecular: { bg:'rgba(168,85,247,0.10)',  border:'rgba(168,85,247,0.28)', text:'#a855f7' },
  other:     { bg:'rgba(100,116,139,0.10)', border:'rgba(100,116,139,0.25)',text:'#64748b' },
};

/* ──────────────────────────────────────────────────────────────
   SUPPLIER COLOR MAP
   ────────────────────────────────────────────────────────────── */
window.DB_SUPPLIER_COLORS = {
  'МЕТРО':     '#3b82f6',
  'MHP':       '#ef4444',
  'Fozzy':     '#f59e0b',
  'Київхліб':  '#a78bfa',
  'Badagoni':  '#fb923c',
  'AVS-Trade': '#2ECC71',
};

/* ──────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────── */
window.INGREDIENT_DB.findByName = function(name) {
  const q = name.toLowerCase().trim();
  return this.find(i =>
    i.name.toLowerCase() === q ||
    (i.name_ua||'').toLowerCase() === q ||
    (i.name_ru||'').toLowerCase() === q
  ) || null;
};

window.INGREDIENT_DB.findByNameLoose = function(name, lang) {
  const q = name.toLowerCase().trim();
  const nk = lang === 'en' ? 'name' : ('name_' + lang);
  return this.filter(i => {
    const n = (i[nk] || i.name || '').toLowerCase();
    return n.startsWith(q) || n.includes(q);
  });
};

/* ──────────────────────────────────────────────────────────────
   PRICE SYNC LAYER
   Stores overridden prices: { [name_lc]: { price, updatedAt } }
   ────────────────────────────────────────────────────────────── */
function loadPriceOverrides() {
  try { return JSON.parse(localStorage.getItem('dl_price_overrides') || '{}'); }
  catch(e) { return {}; }
}
function savePriceOverrides(obj) {
  try { localStorage.setItem('dl_price_overrides', JSON.stringify(obj)); }
  catch(e) {}
}
function getEffectivePrice(name, fallbackPrice) {
  const overrides = loadPriceOverrides();
  const key = (name || '').toLowerCase().trim();
  return overrides[key] ? overrides[key].price : fallbackPrice;
}
function setPriceOverride(name, price) {
  const overrides = loadPriceOverrides();
  const key = (name || '').toLowerCase().trim();
  overrides[key] = { price: parseFloat(price), updatedAt: Date.now() };
  savePriceOverrides(overrides);
}
function getLastUpdated(name) {
  const overrides = loadPriceOverrides();
  const key = (name || '').toLowerCase().trim();
  return overrides[key]?.updatedAt || null;
}

window.DB_PRICE_SYNC = { loadPriceOverrides, savePriceOverrides, getEffectivePrice, setPriceOverride, getLastUpdated };

/* ──────────────────────────────────────────────────────────────
   DEBUG
   ────────────────────────────────────────────────────────────── */
const _cats = {};
window.INGREDIENT_DB.forEach(i => { _cats[i.category] = (_cats[i.category]||0)+1; });
console.log(`[Dishlytics DB v3] ${window.INGREDIENT_DB.length} items.`, _cats);