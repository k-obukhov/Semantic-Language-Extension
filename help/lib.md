# Core
* ```public procedure() Pause``` — остановка выполнения программы до нажатия на любую клавишу
* ```public function(val integer arg): real ToReal``` — приведение целого числа к вещественному
* ```public function(val real arg): integer ToInteger``` — приведение вещественного числа к целому
* ```public function(val character arg): integer Ord``` — получение числового кода символа
* ```public function(val integer arg): character Chr``` — получение символа по его числовому коду
# Files
* ```public empty class File;``` — поток для открытия файла, делегируется классу из целевого языка
* ```public function(val string path, val character options): File Open``` — открытие файла по заданному пути. Список опций:
  * ```r``` — чтение файла
  * ```w``` — запись с удалением прошлого содержимого файла
  * ```a``` — дозапись в конец файла
  * ```+``` — чтение и запись
* ```public procedure(ref File f) Close``` — закрывает файловый поток
* ```public procedure(ref File f, val integer value) WriteInteger``` — запись целого числа
* ```public procedure(ref File f, val real value) WriteReal``` — запись вещественного числа
* ```public procedure(ref File f, val string value) WriteString``` — запись строки (лучше всего записывать строку в которой нет разделителей, если хотите её верно прочесть)
* ```public procedure(ref File f, val character value) WriteCharacter``` — запись символа
* ```public procedure(ref File f, val boolean value) WriteBoolean``` — запись булево значения (приведется к 0 или 1)
* ```public function(ref File f): integer ReadInteger``` — чтение целого числа
* ```public function(ref File f): real ReadReal``` — чтение вещественного числа
* ```public function(ref File f): string ReadString``` — чтение строки
* ```public function(ref File f): character ReadCharacter``` — чтение символа
* ```public function(ref File f): boolean ReadBoolean``` — чтение булево значения
* ```public function(ref File f): boolean IsOpen``` — проверка на то, что файл открыт
* ```public function(ref File f): boolean IsEOF``` — проверка на то, что был достигнут конец файла
# Math
* ```public const real PI;``` — Константа PI
* ```public const real E;``` — Константа E
* ```public function(val real arg): real Sin``` — вычисление синуса
* ```public function(val real arg): real Cos``` — вычисление косинуса
* ```public function(val real arg): real Tan``` — вычисление тангенса
* ```public function(val real arg): real ATan``` — вычисление арктангенса
* ```public function(val real arg): real ACos``` — вычисление арккосинуса
* ```public function(val real arg): real ASin``` — вычисление арксинуса
* ```public function(val real first, val real second): real ATan2``` — вычисление atan2 
* ```public function(val real arg): real Exp``` — вычисление экспоненты
* ```public function(val real arg): real Log``` — натуральный логарифм
* ```public function(val real arg): real Log10``` — логарифм с основанием 10
* ```public function(val real arg): real Log2``` — логарифм с основанием 2
* ```public function(val real arg): real Exp2``` — экспонента с основанием 2
* ```public function(val real first, val real second): real Pow``` — вычисление степени first^second
* ```public function(val real arg): real Sqrt``` — квадратный корень
* ```public function(val real arg): integer Ceil``` — округление в большую сторону
* ```public function(val real arg): integer Floor``` — округление в меньшую сторону
* ```public function(val real arg): integer Round``` — округление математическое
* ```public function(val real arg): real Fabs``` — абсолютное значение для дробных
* ```public function(val integer arg): integer Abs``` — абсолютное значение для целых
# Random
* ```public function(): real Rnd``` — возвращает случайное число от 0 до 1
* ```public function(val real first, val real last): real RangeReal``` — случайное дробное в заданном диапазоне
* ```public function(val integer first, val integer last): real RangeInteger``` — случайное целое в заданном диапазоне
# String
* ```public function(val string arg): integer Length``` — длина строки
* ```public function(val string left, val string right): boolean Equals``` — проверка на равенство
* ```public function(val string left, val string right): boolean Less``` — true, если первая строка меньше второй
* ```public function(val string left, val string right): boolean Greater``` — true, если первая строка больше второй
* ```public function(val string left, val string right): boolean LessOrEquals``` — true, если первая строка меньше или равна второй
* ```public function(val string left, val string right): boolean GreaterOrEquals``` — true, если первая строка больше или равна второй
* ```public function(val string left, val string right): boolean NotEquals``` — проверка на неравенство
* ```public function(val string str, val character chr): string AddChar``` — добавляет символ в конец строки
* ```public function(val string lhs, val string rhs): string Concat``` — соединение строк
* ```public function(val integer arg): string IntToString``` — перевод целого числа в строку
* ```public function(val real arg): string RealToString``` — перевод вещественного числа в строку
# System
* ```public base class Object``` — базовый класс для всех остальных классов