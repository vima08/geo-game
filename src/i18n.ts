import type { PointOfInterest } from './types';

export type Language = 'en' | 'ru';
const LANGUAGE_KEY = 'bostandyk-trails-language-v1';

export function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch { /* Fall back to the browser language when storage is blocked. */ }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function saveLanguage(language: Language): void {
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Progress UI reports storage issues separately. */ }
}

const strings = {
  simulationBanner: ['SIMULATION MODE · REAL GPS OFF', 'РЕЖИМ СИМУЛЯЦИИ · РЕАЛЬНЫЙ GPS ОТКЛЮЧЁН'],
  journal: ['FIELD JOURNAL · BOSTANDYK', 'ПОЛЕВОЙ ЖУРНАЛ · БОСТАНДЫК'],
  title: ['Bostandyk Trails', 'Тропы Бостандыка'],
  almatyJournal: ['ALMATY FIELD JOURNAL', 'ПОЛЕВОЙ ЖУРНАЛ АЛМАТЫ'],
  bostandykTitle: ['Bostandyk Trails', 'Тропы Бостандыка'], goldenTitle: ['Golden Square Echoes', 'Эхо Золотого квадрата'],
  bostandykDesc: ['Five dispersed landmarks and the sigils of a forgotten city atlas.', 'Пять знаковых мест и символы забытого городского атласа.'], goldenDesc: ['A compact walk through five voices of Almaty’s historic centre.', 'Компактная прогулка по пяти голосам исторического центра Алматы.'],
  chooseAdventure: ['Choose adventure', 'Выбрать приключение'], route: ['ROUTE', 'МАРШРУТ'], changeRoute: ['Change route', 'Сменить маршрут'],
  openSettings: ['Open settings', 'Открыть настройки'],
  secretsFound: ['{n} of 5 secrets found', 'Найдено секретов: {n} из 5'],
  atlasUnopened: ['Atlas unopened', 'Атлас ещё не открыт'],
  saveError: ['Progress cannot be saved on this device. Check browser storage settings.', 'Не удалось сохранить прогресс. Проверьте настройки хранилища браузера.'],
  firstHint: ['Walk to a numbered marker. Enter its ring to uncover a sigil.', 'Подойдите к пронумерованной метке. Войдите в её круг, чтобы открыть символ.'],
  atlasComplete: ['✦ Atlas complete — read the final page', '✦ Атлас собран — откройте последнюю страницу'],
  mapLabel: ['Map of Bostandyk points of interest', 'Карта интересных мест Бостандыка'],
  center: ['Center on me', 'Где я'],
  mapOffline: ['Map tiles unavailable. The trail still works.', 'Карта недоступна, но игра и расстояния продолжают работать.'],
  discovered: ['DISCOVERED', 'ОТКРЫТО'], selectedTrail: ['SELECTED TRAIL', 'ВЫБРАННАЯ ТОЧКА'],
  allTrails: ['All five trails', 'Все пять точек'],
  privacyFooter: ['Location stays on this device.', 'Геопозиция остаётся на устройстве.'], safetyFooter: ['Stay aware outdoors.', 'Будьте внимательны на улице.'],
  gpsNotStarted: ['GPS not started', 'GPS не запущен'], finding: ['Finding your position…', 'Определяем ваше положение…'], gpsActive: ['GPS active', 'GPS активен'],
  permissionDenied: ['Permission denied · retry in settings', 'Нет разрешения · повторите в настройках'], gpsUnavailable: ['GPS unavailable · retry', 'GPS недоступен · повторите'], gpsTimeout: ['GPS timed out · retry', 'GPS не ответил · повторите'], gpsUnsupported: ['Geolocation unsupported', 'Геолокация не поддерживается'],
  simulated: ['Simulated', 'Симуляция'], lastFix: ['Last fix', 'Последняя позиция'], stale: ['position is stale', 'данные устарели'], simulationReady: ['Simulation ready · choose a position', 'Симуляция готова · выберите позицию'],
  collected: ['collected', 'получен'], reopen: ['Reopen this memory any time.', 'Эту историю можно открыть снова.'], chooseSim: ['Choose a simulated position', 'Выберите тестовую позицию'], openDevBelow: ['Open Developer controls below to begin.', 'Откройте панель разработчика внизу.'],
  turnOn: ['Turn on location to begin', 'Включите геолокацию'], locationWhileOpen: ['We only read it while the game is open.', 'Координаты используются только пока игра открыта.'], signalLost: ['Location signal lost', 'Сигнал геолокации потерян'], lastFixDistance: ['Your last fix is kept for distance only. Retry GPS before unlocking.', 'Последняя позиция показана только для расстояния. Повторите GPS перед открытием.'],
  gpsUncertain: ['GPS uncertain — stay nearby', 'Неточный GPS — оставайтесь рядом'], settle: ['Accuracy is ±{n} m. Let the signal settle before unlocking.', 'Точность ±{n} м. Подождите более точного сигнала.'], radius: ['Discovery radius: {n} m', 'Радиус открытия: {n} м'], weak: [' · GPS signal is weak', ' · слабый сигнал GPS'],
  arrived: ['You’ve arrived — unlock this secret', 'Вы на месте — откройте секрет'], almost: ['Almost there — {distance}', 'Почти на месте — {distance}'], away: ['{distance} away', 'До места: {distance}'],
  openMemory: ['Open discovered memory', 'Открыть найденную историю'], openDev: ['Open developer controls', 'Открыть панель разработчика'], enableLocation: ['Enable my location', 'Включить геолокацию'], retryLocation: ['Retry location', 'Повторить геолокацию'], waitingGps: ['Waiting for a clearer GPS fix…', 'Ждём более точный сигнал GPS…'], discoverPlace: ['Discover this place ✦', 'Открыть это место ✦'], frame: ['Frame me and this place', 'Показать меня и это место'], gpsNeeded: ['GPS needed', 'Нужен GPS'],
  onboardingEyebrow: ['WALKING ADVENTURES IN ALMATY', 'ПЕШИЕ ПРИКЛЮЧЕНИЯ В АЛМАТЫ'], onboardingTitle: ['Two city trails are waiting to be explored.', 'Вас ждут два городских маршрута.'], onboardingBody: ['Visit real public places, uncover five secrets on each trail, and build two living city atlases.', 'Посетите реальные общественные места, откройте по пять секретов на каждом маршруте и соберите два живых атласа города.'],
  privateTitle: ['Your location stays private', 'Ваша геопозиция остаётся приватной'], privateBody: ['No account. No history upload. Progress is saved only in this browser.', 'Без аккаунта и отправки истории перемещений. Прогресс хранится только в этом браузере.'], safety: ['Look up around traffic. Use crossings, stay in public areas, and stop walking before using your phone.', 'Следите за дорогой, пользуйтесь переходами и оставайтесь в общественных местах. Остановитесь, прежде чем смотреть в телефон.'], start: ['Start exploring', 'Начать исследование'], permissionNext: ['Your browser will ask for location next.', 'Далее браузер запросит доступ к геолокации.'], close: ['Close', 'Закрыть'],
  memory: ['ATLAS MEMORY', 'ПАМЯТЬ АТЛАСА'], reached: ['YOU REACHED THIS PLACE', 'ВЫ ДОБРАЛИСЬ ДО МЕСТА'], fiveSigils: ['Five sigils. One living city.', 'Пять символов. Один живой город.'], atlasReady: ['Your recovered atlas is ready to open.', 'Восстановленный атлас готов к открытию.'], blankPage: ['A new blank page waits.', 'В атласе ждёт новая пустая страница.'], openCompleted: ['Open completed atlas', 'Открыть собранный атлас'], next: ['Next: {name}', 'Дальше: {name}'], wrong: ['Not quite. Look at the place, then try again.', 'Не совсем. Осмотритесь вокруг и попробуйте ещё раз.'],
  recoveredAtlas: ['THE RECOVERED ATLAS', 'ВОССТАНОВЛЕННЫЙ АТЛАС'], remembered: ['Bostandyk, remembered', 'Бостанды́к, сохранённый в памяти'], collectedSigils: ['Your collected sigils', 'Ваши собранные символы'], ending: ['Leaf, pattern, friendship, stone, and sky reveal the secret: a city is not its map, but the lives and paths that connect its places.', 'Лист, узор, дружба, камень и небо открывают секрет: город — это не карта, а люди и пути, которые соединяют его места.'], atlasPartial: ['Each visited place restores one mark. The locked pages are still waiting outdoors.', 'Каждое посещённое место возвращает один знак. Закрытые страницы всё ещё ждут вас на улицах города.'], undiscoveredSigil: ['Undiscovered sigil', 'Неоткрытый символ'], visitMarker: ['Visit its numbered marker', 'Посетите его метку на карте'], closeAtlas: ['Close the atlas', 'Закрыть атлас'], continueExploring: ['Continue exploring', 'Продолжить исследование'],
  goldenRemembered: ['Golden Square, remembered', 'Золотой квадрат, сохранённый в памяти'], goldenEnding: ['Word, ornament, stage, time, and memory reveal the secret: the old centre stays alive because every generation gives its streets a new voice.', 'Слово, орнамент, сцена, время и память открывают секрет: старый центр жив, потому что каждое поколение дарит его улицам новый голос.'],
  fieldKit: ['FIELD KIT', 'ПОЛЕВОЙ НАБОР'], settingsPrivacy: ['Settings & privacy', 'Настройки и приватность'], privateDesign: ['Private by design.', 'Приватность заложена в основу.'], privacyLong: ['Coordinates stay in this browser. There is no account, location upload, analytics, or telemetry. Progress uses local storage.', 'Координаты остаются в браузере. Здесь нет аккаунта, отправки геопозиции, аналитики или телеметрии. Прогресс хранится локально.'], backgroundGps: ['GPS is read only while open; browsers do not provide reliable background tracking.', 'GPS используется только пока игра открыта: браузеры не обеспечивают надёжное фоновое отслеживание.'], language: ['Language', 'Язык'], retryGps: ['Retry GPS', 'Повторить GPS'], exitSimulation: ['Exit Simulation Mode', 'Выйти из режима симуляции'], openSimulation: ['Open Simulation Mode', 'Открыть режим симуляции'], resetAll: ['Reset all progress', 'Сбросить весь прогресс'], resetConfirm: ['Erase all discoveries and restart?', 'Удалить все открытия и начать заново?'],
  devControls: ['Developer controls', 'Панель разработчика'], simulatedTarget: ['Simulated target', 'Тестовая точка'], near: ['Near (80 m)', 'Рядом (80 м)'], inside: ['Inside radius', 'Внутри радиуса'], poor: ['Poor accuracy', 'Низкая точность'], trigger: ['Trigger discovery', 'Запустить открытие'], source: ['Source', 'Источник'], accuracy: ['Accuracy', 'Точность'], selectedDistance: ['Selected / distance', 'Точка / расстояние'], activationRadius: ['Activation radius', 'Радиус открытия'], resetProgress: ['Reset progress', 'Сбросить прогресс'],
} satisfies Record<string, readonly [string, string]>;

export type TranslationKey = keyof typeof strings;
export function t(language: Language, key: TranslationKey, values: Record<string, string | number> = {}): string {
  let result: string = strings[key][language === 'ru' ? 1 : 0];
  for (const [name, value] of Object.entries(values)) result = result.replace(`{${name}}`, String(value));
  return result;
}

interface PoiTranslation { name: string; shortName: string; description: string; reward: string; prompt: string; choices: string[]; success: string }
const russianPois: Record<string, PoiTranslation> = {
  'botanical-garden': { name: 'Главный ботанический сад — южный вход', shortName: 'Ботанический сад', description: 'У общественного входа старые деревья укрывают живую страницу забытого городского атласа.', reward: 'Символ Листа', prompt: 'Знак скрыт в том, как растут деревья. О чём рассказывают годичные кольца?', choices: ['О направлении ветра', 'О прожитых годах', 'О расстоянии до воды'], success: 'Появляется Символ Листа — память о каждом сезоне, пережитом городом.' },
  'atakent-pavilion': { name: 'Атакент — главный павильон', shortName: 'Павильон Атакент', description: 'На открытой территории выставочного комплекса строгая геометрия хранит точный узор атласа.', reward: 'Символ Узора', prompt: 'Посмотрите на геометрию павильона. Какой узор может образовать координатную сетку?', choices: ['Пересекающиеся линии', 'Спирали'], success: 'Символ Узора выравнивается. Улицы и тропы складываются в понятную сетку.' },
  'dostyk-park': { name: 'Парк Достык', shortName: 'Парк Достык', description: 'Уютный районный парк, где разговоры несут тёплый фрагмент маршрута.', reward: 'Символ Дружбы', prompt: '«Достық» означает дружбу. Что становится богаче, когда им делятся?', choices: ['Путешествие', 'Запертая дверь'], success: 'Символ Дружбы светится. Каждое совместное путешествие добавляет в атлас новый путь.' },
  'satpayev-monument': { name: 'Памятник Канышу Сатпаеву', shortName: 'Памятник Сатпаеву', description: 'Геолог хранит высеченную в камне подсказку атласа на открытой площади.', reward: 'Символ Камня', prompt: 'Геолог читает глубинное время. Что хранит самые древние истории Земли?', choices: ['Облако', 'Фонарь', 'Камень'], success: 'Символ Камня пробуждается. Глубинное время оставляет в атласе прочный знак.' },
  'independence-monument': { name: 'Монумент Независимости — площадь Республики', shortName: 'Монумент Независимости', description: 'Под Золотым человеком, в открытом сердце города, ждёт знак атласа.', reward: 'Символ Неба', prompt: 'Пять маршрутов сходятся вместе. Что превращает отдельные места в живой город?', choices: ['Люди между ними', 'Самое высокое здание', 'Граница на карте'], success: 'Символ Неба завершает атлас. Тайный маршрут Бостандыка останется в вашей памяти.' },
  'gold-lermontov-theatre': { name: 'Национальный театр драмы имени Лермонтова', shortName: 'Театр Лермонтова', description: 'На открытой площади перед театром старый центр хранит голос, созданный для сцены.', reward: 'Символ Слова', prompt: 'Написанная строка ждёт голоса. Что оживляет пьесу?', choices: ['Закрытая книга', 'Актёры и зрители', 'Пустой зал'], success: 'Символ Слова отвечает. Город помнит свои истории, пока кто-то произносит их вслух.' },
  'gold-golovizin-house': { name: 'Дом Головизина — вид с улицы', shortName: 'Дом Головизина', description: 'С общественного тротуара виден фасад в стиле модерн, сохранивший орнамент старого Верного.', reward: 'Символ Орнамента', prompt: 'Смотрите только с тротуара: какая деталь придаёт историческому дому его характер?', choices: ['Растительная лепнина', 'Стеклянные башни', 'Стальные мосты'], success: 'Символ Орнамента раскрывается. Каменные листья несут столетие городской памяти.' },
  'gold-abay-opera': { name: 'Театр оперы и балета имени Абая — главная площадь', shortName: 'Оперный театр Абая', description: 'Парадная общественная площадь хранит эхо музыки, движения и казахского орнамента.', reward: 'Символ Сцены', prompt: 'Опера соединяет несколько искусств на одной сцене. Какая пара звучит вместе?', choices: ['Голос и оркестр', 'Тишина и пустой занавес'], success: 'Символ Сцены звучит. Площадь превращается в театр под открытым небом.' },
  'gold-nedelka-fountain': { name: 'Фонтан «Неделька»', shortName: 'Фонтан «Неделька»', description: 'Семь фигур собрались вокруг любимого городского фонтана, названного в честь дней недели.', reward: 'Символ Времени', prompt: '«Неделька» движется по знакомому кругу. Сколько дней завершают этот цикл?', choices: ['Пять', 'Семь', 'Десять'], success: 'Символ Времени поворачивается. Обычные дни становятся ритмом живого района.' },
  'gold-kunaev-museum': { name: 'Дом-музей Кунаева — снаружи', shortName: 'Дом-музей Кунаева', description: 'У фасада музея на улице Тулебаева личные вещи превращаются в общую историю.', reward: 'Символ Памяти', prompt: 'Дом становится музеем, когда его предметы начинают рассказывать чью историю?', choices: ['Только историю здания', 'Человека и его эпохи', 'Ничью'], success: 'Символ Памяти занимает место в атласе. Теперь пять голосов старого центра звучат вместе.' },
};

export function poiText(poi: PointOfInterest, language: Language): PoiTranslation {
  if (language === 'ru') return russianPois[poi.id];
  return { name: poi.name, shortName: poi.shortName, description: poi.description, reward: poi.reward.name, prompt: poi.event.prompt, choices: poi.event.choices, success: poi.event.success };
}
