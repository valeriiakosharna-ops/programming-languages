const square = {
 python:`# Керуємо черепашкою: крок у пікселях, поворот у градусах
from turtle import forward, right, color

color("#00A6EB")
forward(90)
right(90)
forward(90)
right(90)
forward(90)
right(90)
forward(90)
right(90)`,
 javascript:`// Команди turtle надає цей тренажер
turtle.color("#00A6EB");
turtle.forward(90);
turtle.right(90);
turtle.forward(90);
turtle.right(90);
turtle.forward(90);
turtle.right(90);
turtle.forward(90);
turtle.right(90);`,
 java:`// Turtle — навчальна бібліотека цього тренажера
public class Main {
    public static void main(String[] args) {
        Turtle.color("#00A6EB");
        Turtle.forward(90);
        Turtle.right(90);
        Turtle.forward(90);
        Turtle.right(90);
        Turtle.forward(90);
        Turtle.right(90);
        Turtle.forward(90);
        Turtle.right(90);
    }
}`,
 cpp:`// turtle.h — навчальна бібліотека цього тренажера
#include "turtle.h"

int main() {
    turtle::color("#00A6EB");
    turtle::forward(90);
    turtle::right(90);
    turtle::forward(90);
    turtle::right(90);
    turtle::forward(90);
    turtle::right(90);
    turtle::forward(90);
    turtle::right(90);
    return 0;
}`,
 php:`<?php
// turtle.php — навчальна бібліотека цього тренажера
require 'turtle.php';

color("#00A6EB");
forward(90);
right(90);
forward(90);
right(90);
forward(90);
right(90);
forward(90);
right(90);`
};
const spiral = {
 python:`from turtle import forward, right, color

color("#E60036")
steps = 20
for i in range(steps):
    forward(12 + i * 5)
    right(90)`,
 javascript:`turtle.color("#E60036");
const steps = 20;
for (let i = 0; i < steps; i++) {
    turtle.forward(12 + i * 5);
    turtle.right(90);
}`,
 java:`public class Main {
    public static void main(String[] args) {
        Turtle.color("#E60036");
        int steps = 20;
        for (int i = 0; i < steps; i++) {
            Turtle.forward(12 + i * 5);
            Turtle.right(90);
        }
    }
}`,
 cpp:`#include "turtle.h"

int main() {
    turtle::color("#E60036");
    int steps = 20;
    for (int i = 0; i < steps; i++) {
        turtle::forward(12 + i * 5);
        turtle::right(90);
    }
    return 0;
}`,
 php:`<?php
require 'turtle.php';

color("#E60036");
$steps = 20;
for ($i = 0; $i < $steps; $i++) {
    forward(12 + $i * 5);
    right(90);
}`
};
const intro = {
 python:[['from turtle import …','Підключаємо навчальні команди малювання. У Python # починає коментар.'],['forward(90)','Рухаємося вперед на 90 пікселів і залишаємо лінію.'],['right(90)','Повертаємося праворуч на 90°. Поворот сам по собі лінію не малює.'],['color("#00A6EB")','Задаємо колір лінії. Текст пишемо в парних лапках.']],
 javascript:[['turtle.forward(90);','Викликаємо команду forward об’єкта turtle. Число — довжина кроку, ; завершує команду.'],['turtle.right(90);','Повертаємо черепашку на 90°. Команди виконуються по черзі.'],['turtle.color("#00A6EB");','Текстове значення кольору записуємо в лапках.'],['// Коментар','Пояснення для людини: цей текст не виконується.']],
 java:[['public class Main { … }','Клас — оболонка програми. У цьому редакторі його назва має бути Main.'],['public static void main(String[] args)','Точка початку програми. Поки залиш цей рядок без змін.'],['Turtle.forward(90);','Рух на 90 пікселів. Turtle.right(90) — поворот, Turtle.color("#00A6EB") — колір.'],['{ … } та ;','Фігурні дужки об’єднують команди, ; завершує кожну команду. // починає коментар.']],
 cpp:[['#include "turtle.h"','Підключаємо навчальні команди черепашки. Це допоміжний файл тренажера.'],['int main() { … }','Виконання програми починається у функції main.'],['turtle::forward(90);','Команда з простору імен turtle. forward — рух, right — поворот, color — колір.'],['return 0;','Завершуємо програму успішно. ; завершує команду, // починає коментар.']],
 php:[['<?php','Позначає початок PHP-коду. Залиш його на першому рядку.'],["require 'turtle.php';",'Підключаємо навчальні функції черепашки.'],['forward(90); та right(90);','Рухаємося на 90 пікселів і повертаємо на 90°. Команди завершуємо ;.'],['color("#00A6EB");','Колір — текст у лапках. // починає коментар.']]
};
const loops={
 python:[['steps = 20','Змінна зберігає кількість кроків. = присвоює значення.'],['for i in range(steps):','Цикл дає i значення від 0 до steps − 1. Після : потрібні відступи у 4 пробіли.'],['12 + i * 5','Кожна наступна лінія довша на 5 пікселів. * означає множення.']],
 javascript:[['const steps = 20;','Створюємо змінну. Її значення в цій програмі не переприсвоюємо.'],['let i = 0; i < steps; i++','Початок із 0, умова продовження та збільшення i на 1.'],['for (…) { … }','Повторюємо команди в дужках. 12 + i * 5 поступово збільшує довжину.']],
 java:[['int steps = 20;','int — тип цілого числа. Змінна визначає кількість кроків.'],['int i = 0; i < steps; i++','Початок із 0, умова продовження та збільшення i на 1.'],['for (…) { … }','Повторюємо команди. 12 + i * 5 збільшує довжину. Залиш Main і main без змін.']],
 cpp:[['int steps = 20;','int позначає ціле число. Змінна зберігає кількість кроків.'],['int i = 0; i < steps; i++','Починаємо з 0; повторюємо, поки i менше steps; збільшуємо i на 1.'],['for (…) { … }','Команди циклу — в дужках. 12 + i * 5 збільшує довжину кожного кроку.']],
 php:[['$steps = 20;','Назви змінних у PHP починаються зі знака $.'],['$i = 0; $i < $steps; $i++','Початок, умова продовження й збільшення числа на 1.'],['for (…) { … }','Повторюємо команди. 12 + $i * 5 збільшує довжину кроку.']]
};
export const languages={python:{name:'Python',file:'main.py'},javascript:{name:'JavaScript',file:'main.js'},java:{name:'Java',file:'Main.java'},cpp:{name:'C++',file:'main.cpp'},php:{name:'PHP',file:'main.php'}};
export function lesson(language,level){return {
 code:level===1?square[language]:spiral[language],
 syntax:level===1?intro[language]:loops[language],
 tag:level===1?'РІВЕНЬ 01 · КОМАНДИ Й ПОСЛІДОВНІСТЬ':'РІВЕНЬ 02 · ЗМІННІ ТА ЦИКЛИ',
 title:level===1?'Намалюй свій перший квадрат':'Закрути кольорову спіраль',
 task:level===1?'Черепашка рухається вперед і повертає. Запусти приклад — чотири лінії складуть квадрат. Зміни довжину одного кроку й подивись, як зміниться фігура.':'Цикл повторює рух і поворот. З кожним кроком лінія стає довшою — так народжується спіраль. Зміни steps із 20 на 30 і порівняй малюнки.',
 hint:level===1?'forward означає «вперед», right — «праворуч». Щоб повернутися в початкову точку, зроби чотири однакові кроки з поворотами на 90°.':'i починається з 0. Довжини кроків: 12, 17, 22… Колір і число steps можна змінювати. Відступи та дужки залиш на місці.',
 challenge:level===1?'Зміни колір #00A6EB на #E60036. А якщо залишити тільки три кроки та повертати на 120° — яка фігура вийде?':'Заміни кут 90 на 89 або 91. Як зміниться спіраль? Потім спробуй інший колір.'
};}
export const demos={
 typescript:{name:'TypeScript',file:'demo.ts',code:`type Friend = { name: string };

function greet(friend: Friend): string {
    return "Привіт, " + friend.name + "!";
}

const friend: Friend = { name: "Олено" };
console.log(greet(friend));`},
 ruby:{name:'Ruby',file:'demo.rb',code:`names = ["Олено", "Тарасе"]

names.each do |name|
  puts "Привіт, #{name}!"
end`}
};
