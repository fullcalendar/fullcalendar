root = global

root.invariants =
  passingSpec: ->
    Invariant -> @result.code == 0
    Invariant -> @result.stderr == ""
    Invariant -> expect(@result.stdout).toContain """
      # fail  0

      # ok
    """

  failingSpecs: (numberOfFailures = 1) ->
    Invariant -> @result.code != 0
    Invariant -> expect(@result.stdout).toContain """
      # fail  #{numberOfFailures}
    """
