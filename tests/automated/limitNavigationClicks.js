
describe('limit navigation click', function() {
    var options;

    beforeEach(function() {
        affix('#calendar');
    });

    describe('when limitNextClicks options is set', function() {
        beforeEach(function() {
            options = {
                limitNextClicks: 3
            };
            $('#calendar').fullCalendar(options);
        });

        it('should disable next button', function() {
            $('.fc-button.fc-next-button').simulate('click');
            $('.fc-button.fc-next-button').simulate('click');
            $('.fc-button.fc-next-button').simulate('click');

            expect($('.fc-button.fc-next-button')).toBeDisabled();
        });
    });

    describe('when limitPrevClicks options is set', function() {
        beforeEach(function() {
            options = {
                limitPrevClicks: 1
            };
            $('#calendar').fullCalendar(options);
        });

        it('should disable prev button', function() {
            $('.fc-button.fc-prev-button').simulate('click');

            expect($('.fc-button.fc-prev-button')).toBeDisabled();
        });
    });

    describe('when limitNextClicks and limitPrevClicks options are set', function() {
        beforeEach(function() {
            options = {
                limitNextClicks: 2,
                limitPrevClicks: 1
            };
            $('#calendar').fullCalendar(options);
        });

        it('should disable buttons after clicks', function() {
            var nextButton = $('.fc-button.fc-next-button');
            var prevButton = $('.fc-button.fc-prev-button');

            expect(prevButton.is(':enabled')).toBe(true);
            expect(nextButton.is(':enabled')).toBe(true);

            nextButton.simulate('click');
            nextButton.simulate('click');

            expect(prevButton.is(':enabled')).toBe(true);
            expect(nextButton).toBeDisabled();

            prevButton.simulate('click');
            prevButton.simulate('click');
            prevButton.simulate('click');

            expect(prevButton).toBeDisabled();
            expect(nextButton.is(':enabled')).toBe(true);
        });
    });
});
