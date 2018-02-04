
describe('Promise', function() {
  var Promise = $.fullCalendar.Promise

  describe('when result given at instantiation', function() {

    it('executes the then function immediately', function() {
      var p = Promise.resolve(7)
      var executedThen = false

      p.then(function(val) {
        executedThen = true
        expect(val).toBe(7)
      })

      expect(executedThen).toBe(true)
    })

    it('forwards on the result of the then function', function() {
      var p = Promise.resolve(7)
      var executedSecondThen = false

      p.then(function(val) {
        expect(val).toBe(7)
        return 8
      }).then(function(val) {
        expect(val).toBe(8)
        executedSecondThen = true
      })

      expect(executedSecondThen).toBe(true)
    })
  })
})
