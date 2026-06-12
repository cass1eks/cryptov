const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'crypto.db'));

const kuznechikContent = [
  // БЛОК 1: X-преобразование
  { page: 'kuznechik', section: 'title_1', content: 'X-преобразование — наложение ключа' },
  { page: 'kuznechik', section: 'text_1_1', content: 'На каждом раунде 128-битное состояние складывается по модулю 2 (XOR) с раундовым ключом. Это единственный шаг, зависящий от ключа.' },
  { page: 'kuznechik', section: 'text_1_2', content: 'Формула: X(a, b) = a ⊕ b' },
  { page: 'kuznechik', section: 'text_1_3', content: 'В отличие от AES, в «Кузнечике» X-преобразование применяется как в начале, так и в конце каждого раунда.' },

  // БЛОК 2: S-преобразование
  { page: 'kuznechik', section: 'title_2', content: 'S-преобразование — нелинейная замена' },
  { page: 'kuznechik', section: 'text_2_1', content: 'Каждый байт состояния заменяется по таблице π (S-Box). Это единственное нелинейное преобразование в алгоритме.' },
  { page: 'kuznechik', section: 'text_2_2', content: 'S-Box построен на основе преобразования в поле Галуа GF(2⁸) с использованием полинома x⁸ + x⁷ + x⁶ + x⁵ + x⁴ + x³ + 1.' },
  { page: 'kuznechik', section: 'text_2_3', content: 'Пример: байт 00 заменяется на FC, байт 01 на EE и т.д.' },

  // БЛОК 3: L-преобразование
  { page: 'kuznechik', section: 'title_3', content: 'L-преобразование — линейное перемешивание' },
  { page: 'kuznechik', section: 'text_3_1', content: 'Линейное преобразование над 128-битным вектором состояния. Выполняется как умножение на фиксированную матрицу в поле Галуа GF(2⁸).' },
  { page: 'kuznechik', section: 'text_3_2', content: 'Формула: L(x) = R¹⁶(x × l), где l — фиксированный вектор, R¹⁶ — 16-кратный сдвиг регистра.' },
  { page: 'kuznechik', section: 'text_3_3', content: 'Обеспечивает лавинный эффект — изменение одного бита на входе влияет на все биты на выходе.' },
  { page: 'kuznechik', section: 'text_3_4', content: 'В отличие от AES, где MixColumns работает только внутри столбцов, L-преобразование перемешивает весь блок целиком.' },

  // БЛОК 4: Структура раунда
  { page: 'kuznechik', section: 'title_4', content: 'Структура раунда' },
  { page: 'kuznechik', section: 'text_4_1', content: 'Каждый раунд «Кузнечика» состоит из трёх преобразований:' },
  { page: 'kuznechik', section: 'list_4', content: 'X[Kᵢ] — XOR с раундовым ключом; S — замена через S-Box π; L — линейное преобразование' },
  { page: 'kuznechik', section: 'text_4_2', content: 'Всего выполняется 9 полных раундов (X → S → L) и 10-й финальный раунд (X → S), без L-преобразования.' },

  // БЛОК 5: Генерация ключей
  { page: 'kuznechik', section: 'title_5', content: 'Генерация раундовых ключей' },
  { page: 'kuznechik', section: 'text_5_1', content: 'Из 256-битного исходного ключа генерируются 11 раундовых ключей по 128 бит.' },
  { page: 'kuznechik', section: 'list_5', content: 'Исходный ключ разбивается на две половины: K1 (младшие 128 бит) и K2 (старшие 128 бит); Для i от 1 до 9: генерируются константы Ci; K(i+2) = L(S(K(i+1) ⊕ Ci)) ⊕ Ki' },
  { page: 'kuznechik', section: 'text_5_2', content: 'Особенность: раундовые ключи используются в прямом порядке для шифрования и в обратном — для расшифрования.' },

  // БЛОК 6: Режимы работы
  { page: 'kuznechik', section: 'title_6', content: 'Режимы работы ГОСТ «Кузнечик»' },
  { page: 'kuznechik', section: 'text_6_1', content: 'Стандарт ГОСТ Р 34.12-2015 определяет несколько режимов шифрования:' },
  { page: 'kuznechik', section: 'subtitle_6_1', content: 'ECB — простой режим' },
  { page: 'kuznechik', section: 'text_6_2', content: 'Каждый блок шифруется независимо. Одинаковые блоки → одинаковый шифротекст. Не рекомендуется.' },
  { page: 'kuznechik', section: 'subtitle_6_2', content: 'CBC — режим сцепления блоков' },
  { page: 'kuznechik', section: 'text_6_3', content: 'Каждый блок XOR-ится с предыдущим шифротекстом. Нужен случайный IV.' },
  { page: 'kuznechik', section: 'subtitle_6_3', content: 'CTR — режим счётчика' },
  { page: 'kuznechik', section: 'text_6_4', content: 'Использует счётчик, который шифруется и затем XOR-ится с открытым текстом. Поддерживает параллельное шифрование.' },

  // БЛОК 7: Безопасность
  { page: 'kuznechik', section: 'title_7', content: 'Безопасен ли ГОСТ «Кузнечик»?' },
  { page: 'kuznechik', section: 'text_7_1', content: 'Да, алгоритм считается криптостойким и одобрен для использования в государственных информационных системах.' },
  { page: 'kuznechik', section: 'list_7', content: 'Длина ключа: 256 бит — устойчив к полному перебору; SP-сеть: обеспечивает хороший лавинный эффект; S-Box: построен на математически обоснованных принципах' },
  { page: 'kuznechik', section: 'text_7_2', content: 'На данный момент не опубликовано атак, эффективно взламывающих полный 10-раундовый вариант.' },

  // БЛОК 8: Где используется
  { page: 'kuznechik', section: 'title_8', content: 'Где используется «Кузнечик»?' },
  { page: 'kuznechik', section: 'list_8', content: 'Государственные информационные системы РФ; Банковские и финансовые учреждения; Средства криптографической защиты информации (СКЗИ); VPN и защищённые каналы связи; Шифрование данных в базах данных; Удостоверяющие центры и ЭЦП' },
  { page: 'kuznechik', section: 'text_8_1', content: '«Кузнечик» является обязательным к использованию при защите государственной тайны в РФ.' },

  // БЛОК 9: Сравнение с AES
  { page: 'kuznechik', section: 'title_9', content: 'Сравнение с AES' },
  { page: 'kuznechik', section: 'list_9', content: 'Размер блока: 128 бит (оба); Длина ключа: 256 бит (Кузнечик) vs 128/192/256 (AES); Число раундов: 10 (оба); Тип сети: SP-сеть (оба); S-Box: разный (π у Кузнечика, Rijndael у AES); Перемешивание: L-преобразование (весь блок) vs MixColumns (по столбцам)' },
  { page: 'kuznechik', section: 'text_9_1', content: '«Кузнечик» — это российский аналог AES, обладающий схожей архитектурой, но с уникальной математической основой и усиленной защитой за счёт 256-битного ключа по умолчанию.' },

  // БЛОК 10: Коротко об алгоритме
  { page: 'kuznechik', section: 'title_10', content: 'Коротко о ГОСТ «Кузнечик»' },
  { page: 'kuznechik', section: 'list_10', content: 'Размер блока: 128 бит; Ключ: 256 бит (фиксированный); Число раундов: 10 (9 с L + 1 без L); Архитектура: SP-сеть; S-Box: π (256 значений); Статус: действующий государственный стандарт РФ; Год принятия: 2015 (заменил ГОСТ 28147-89)' },
  { page: 'kuznechik', section: 'text_10_1', content: '«Кузнечик» — это современный российский стандарт шифрования, сочетающий высокую производительность и криптостойкость. Он является прямым аналогом AES и используется для защиты информации в государственных и коммерческих системах.' }
];

db.serialize(() => {
  db.run("DELETE FROM page_content WHERE page = 'kuznechik'");
  
  const stmt = db.prepare(
    `INSERT INTO page_content (page, section, content) VALUES (?, ?, ?)`
  );
  for (const item of kuznechikContent) {
    stmt.run(item.page, item.section, item.content);
  }
  stmt.finalize();
  console.log(`Kuznechik content inserted! (${kuznechikContent.length} records)`);
  db.close();
});