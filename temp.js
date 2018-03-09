let tada = {
  hi : function() {
    console.log('say hi');
    return this;
  },

  yeah : function() {
    console.log('say yeah');
    return this;
  }
}

tada.hi().yeah()