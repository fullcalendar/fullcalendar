describe "jasmine-fixture", ->
  describe "affixing things", ->
    invariants.passingSpec()

    describe "a simple div", ->
      Given -> createSpec """
        describe 'foo', ->
          Given -> @foo = 1
          When -> @foo++
          Then -> @foo == 2
      """
      When (done) -> runSpec done, (result) ->
        @result = result
      Then -> expect(@result.stdout).toMatch(/ok.*- foo then this.foo === 2/)
