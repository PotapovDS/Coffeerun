(function(window) {
   'use strict';
   var App = window.App || {};
   var $ = window.jQuery;

   function CheckList(selector) {
      if (!selector) {
         throw new Error('No selector provided');
      }

      this.$element = $(selector);
      if (this.$element.length === 0) {
         throw new Error('Could not find element with selector: ' + selector);
      }
   }

   function Row(coffeeOrder) {
      var $div = $('<div></div>', {
         'data-coffee-order': 'checkbox',
         'class': 'checkbox'
      });

      //подсветка строки заказа в зависимости от выбора ароматизатора
      var flavor;
      switch (coffeeOrder.flavor) {
         case 'caramel':
            flavor = '#F5BCA9'
            break;
         case 'almond':
            flavor = '#B45F04'
            break;
         case 'mocha':
            flavor = '#3B240B; color: #F5F6CE' //слишком темный фон, меняем цвет шрифта
            break;
         default:
            flavor = 'white'
      };

      var $label = $('<label></label', {
         style: 'background-color: ' + flavor
      });


      var $checkbox = $('<input></input>', {
         type: 'checkbox',
         value: coffeeOrder.emailAddress,
      });

      var description = coffeeOrder.coffee + ' ';
      description += '(' + coffeeOrder.emailAddress + ') ';
      description += coffeeOrder.size + ' ';

      if (coffeeOrder.flavor) {
         description += coffeeOrder.flavor + ' ';
      };
      description += '[' + coffeeOrder.strength + 'x]';

      $label.append($checkbox);
      $label.append(description);
      $div.append($label);

      this.$element = $div;
   }

   CheckList.prototype.addRow = function(coffeeOrder) {
      //удаляем имеющиеся строки, с указанным адресом почты
      this.removeRow(coffeeOrder.emailAddress);
      var rowElement = new Row(coffeeOrder);
      this.$element.append(rowElement.$element);
   };

   CheckList.prototype.removeRow = function(email) {
      this.$element
         .find('[value="' + email + '"]')
         .closest('[data-coffee-order="checkbox"]')
         .remove();
   };

//затемнение заказа в сиске по нажатию
   CheckList.prototype.blackoutRow = function(email, opacity) {
      this.$element
         .find('[value="' + email + '"]')
         .closest('[data-coffee-order="checkbox"]')
         .attr('style', 'opacity: ' + opacity);
   };

   CheckList.prototype.addClickHandler = function(fn) {
      var timeoutId = null, prevEmail = false;

      this.$element
         .on('click', 'input',
            function(event) {
               var email = event.target.value;
               // если предыдущее нажатие была на том же поле ( с тем же email),
                // то считается повторным нажатием
               if (prevEmail !== email) {
                  this.blackoutRow(email, 0.25);
                  timeoutId = setTimeout(() => {
                     fn(email) //вызывается функция переданная в модуле main, deffered
                        .then(() => {
                           this.removeRow(email);
                        });
                  }, 3000);
                  prevEmail = email;
               } else {
                  clearTimeout(timeoutId);
                  this.blackoutRow(email, 1); //возвращаем обычную видимость элементу
                  console.log('stop remove row');
                  prevEmail = false;
               }
            }.bind(this))
         //обработчик двойного клика
         // при двойном клике заполняем форму данными заказ для редактирования
         .on('dblclick', 'input',
            function(event) {
               var order = $(event.target)
                              .closest("label")
                              .text()
                              .split('')
                              .filter( (elem) => {  // убираем из массива все скобки
                                 return (elem !== '(' &&
                                  elem !== ')' &&
                                  elem !== '[' &&
                                  elem !== ']')
                              })
                              .join('') // пересобираем массив - формируем строку
                              .split(' '); //и разделяем по пробелам

               // прямой и простой вариант заполнения формы, но максимально понятный и быстрый
               var form = $('.form-group');
               form.find("[name='coffee']").val(order[0]);
               form.find("[name='emailAddress']").val(order[1]);
               form.find("[name='size']").val(order[2]);
               form.find("[name='flavor']").val(order[3]);
               form.find("[name='strength']").val(order[4].slice(0, order[4].indexOf('x')));
               // form.find("[name='bonus']").val(order[5]);
            }.bind(this))
   };

   App.CheckList = CheckList;
   window.App = App;
})(window);
