(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, (global.FullCalendarLocales = global.FullCalendarLocales || {}, global.FullCalendarLocales['pt-br'] = factory()));
}(this, function () { 'use strict';

    var ptBr = {
        code: "pt-br",
        buttonText: {
            prevText: "Anterior",
            nextText: "Próximo",
            currentText: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            list: "Compromissos"
        },
        weekLabel: "Sm",
        allDayText: "dia inteiro",
        eventLimitText: function (n) {
            return "mais +" + n;
        },
        noEventsMessage: "Não há eventos para mostrar"
    };

    return ptBr;

}));
