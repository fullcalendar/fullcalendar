describe('buttonIcons', function() {

    beforeEach(function() {
        affix('#cal');
    });

    describe('when buttonIcons is not set', function() {

        beforeEach(function() {
            $('#cal').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'prevYear, nextYear'
                }
            });
        });

        it('should have default values', function() {
            var prevBtn = $('#cal').find('.fc-prev-button');
            var nextBtn = $('#cal').find('.fc-next-button');
            var nextYearBtn = $('#cal').find('.fc-nextYear-button');
            var prevYearBtn = $('#cal').find('.fc-prevYear-button');

            expect(prevBtn.find('span:first')).toHaveClass('fc-icon-left-single-arrow');
            expect(nextBtn.find('span:first')).toHaveClass('fc-icon-right-single-arrow');
            expect(nextYearBtn.find('span:first')).toHaveClass('fc-icon-right-double-arrow');
            expect(prevYearBtn.find('span:first')).toHaveClass('fc-icon-left-double-arrow');
        });
    });

    describe('when buttonIcons is set and theme is falsy', function() {

        beforeEach(function() {
            $('#cal').fullCalendar({
                buttonIcons: {
                    prev: 'some-icon-left',
                    next: 'some-icon-right',
                    prevYear: 'some-icon-leftYear',
                    nextYear: 'some-icon-rightYear'
                },
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'prevYear, nextYear'
                }
            });
        });

        it('should have the set values', function() {
            var prevBtn = $('#cal').find('.fc-prev-button');
            var nextBtn = $('#cal').find('.fc-next-button');
            var prevYearBtn = $('#cal').find('.fc-prevYear-button');
            var nextYearBtn = $('#cal').find('.fc-nextYear-button');


            expect(prevBtn.find('span:first')).toHaveClass('fc-icon-some-icon-left');
            expect(prevBtn.find('span:first')).toHaveClass('fc-icon-some-icon-left');
            expect(prevYearBtn.find('span:first')).toHaveClass('fc-icon-some-icon-leftYear');
            expect(nextYearBtn.find('span:first')).toHaveClass('fc-icon-some-icon-rightYear');
        });
    });

    describe('when theme is true', function() {

        beforeEach(function() {
            $('#cal').fullCalendar({
                theme: true,
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'prevYear, nextYear'
                }
            });
        });

        it('buttonIcons is ignored', function() {
            var prevBtn = $('#cal').find('.fc-prev-button');
            var nextBtn = $('#cal').find('.fc-next-button');
            var prevYearBtn = $('#cal').find('.fc-prevYear-button');
            var nextYearBtn = $('#cal').find('.fc-nextYear-button');

            var classesToSearch = [ '.fc-icon-left-single-arrow', '.fc-icon-right-double-arrow',
                                    '.fc-icon-right-single-arrow', '.fc-icon-left-double-arrow' ];

            for (var i = 0; i < classesToSearch.length; i++) {
                var cls = classesToSearch[i];
                expect($('#cal').find(cls).length).toBe(0);
            };
        });
    });
});
