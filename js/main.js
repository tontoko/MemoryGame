(function() {
  'use strict'

  var stage = document.getElementById('stage')
  var message = document.getElementById('message')
  var slider = document.getElementById('slider')
  var start = document.getElementById('start')
  var label = document.getElementById('label')
  var restart = document.getElementById('restart')
  var input_container = document.getElementById('input-container')
  var message_container = document.getElementById('message-container')
  var memory_num = []
  var memory_mark = []
  var level = 2
  var flipCount = 0
  var firstCard = null
  var secondCard = null
  var player_winCount = 0
  var npc_winCount = 0
  var player_turn = true
  var npc_memorys = []
  var npc_d_memorys = []
  var match_end = false
  var img
  var game_started = false
  var restarted = false
  var error_check = 0

  function card_generate(mark, num) {
    var inner = '<div class="card-back img*"></div><div class="card-front">?</br>!</div>';
    var card = document.createElement('div');
    card.className = 'card'
    card.dataset.num = num
    card.innerHTML = inner.replace('?', mark).replace('!', num).replace('*', img);
    card.addEventListener('click', function() {
      if (player_turn){open_card(this);}
    });
    var container = document.createElement('div');
    container.className = 'card-container hide';
    container.appendChild(card);
    return container;
  }

  function open_card(card) {
    console.log('opencard')
    if (firstCard !== null && secondCard !== null) {
      return;
      // クリック連打防止
    }
    if (card.className.indexOf('open') === -1) {
      card.className = 'card open'
    } else {
      if (!player_turn) {
        call_npc();
      }
      return;
    }
    flipCount++;
    for (var key in npc_memorys) {
      if (npc_memorys[key] === card.dataset.num) {
        npc_d_memorys[key] = npc_memorys[key]
        npc_d_memorys[card.dataset.index] = card.dataset.num
        // AIに重複したカードのペアを記憶
      }
    }
    npc_memorys[card.dataset.index] = card.dataset.num
    // AIにすべての開いたカードを記憶

    if (flipCount % 2 === 1) {
      firstCard = card
      if (!player_turn) {
      setTimeout(function() {npc();}, 100)
      }
    } else {
      secondCard = card
      setTimeout(function() {judge()}, 800);
    }
  }

  function judge() {
    console.log('judge')
    if (firstCard.dataset.num === secondCard.dataset.num) {
      player_winCount += player_turn ? 1 : 0;
      npc_winCount += player_turn ? 0 : 1;
      message.innerHTML = 'あなたの得点: * CPUの得点: +'.replace('*', player_winCount).replace('+', npc_winCount);
      delete npc_memorys[firstCard.dataset.index];
      delete npc_memorys[secondCard.dataset.index];
      delete npc_d_memorys[firstCard.dataset.index];
      delete npc_d_memorys[secondCard.dataset.index];
      // 正答したカードは記憶から削除

      if (player_winCount + npc_winCount === level) {
        match_end = true
        if (player_winCount > npc_winCount) {
          message.innerHTML = 'あなたの得点: * CPUの得点: + あなたの勝ちです！'.replace('*', player_winCount).replace('+', npc_winCount);
        }else {
          message.innerHTML = 'あなたの得点: * CPUの得点: + あなたの負けです'.replace('*', player_winCount).replace('+', npc_winCount);
        }

      }
    } else {
      firstCard.className = 'card';
      secondCard.className = 'card';
      player_turn = !player_turn;
    }
    firstCard = null
    secondCard = null
    if (!player_turn) {
      setTimeout(function() {npc();}, 100)
    }
  }

  function check_duplication(mark, num) {
    error_check = 0;
    for (var i = 0; i <= memory_mark.length; i++) {
      if (memory_mark[i] === mark && memory_num[i] === num) {
        return true;
      }
      if (error_check > 100) {
        reset();
        error_check = 0;
        return;
      }
      error_check++
    }
  }

  function change_mark(num_to_mark) {
    switch (num_to_mark) {
      case 0:
        return '♤';
        break;
      case 1:
        return '♧';
        break;
      case 2:
        return '♢';
        break;
      case 3:
        return '♡';
        break;
    }
  }

  function reset() {
    while (stage.firstChild) stage.removeChild(stage.firstChild);
    error_check = 0;
    init();
    // カード生成時無限ループハマり脱出用
  }

  function init() {
    var cards = []
    var random_card = []
    player_winCount = 0
    npc_winCount = 0
    player_turn = true
    match_end = false
    firstCard = null
    secondCard = null
    flipCount = 0
    error_check = 0;
    memory_num = []
    memory_mark = []
    message.innerHTML = 'あなたの得点: * CPUの得点: +'.replace('*', player_winCount).replace('+', npc_winCount);
    // 初期化

    level = slider.value * 2;
    img = Math.floor(Math.random() * 5) + 1;
    for (var i = 1; i <= level; i++) {
      random_card[0] = Math.floor(Math.random() * 4);
      random_card[1] = Math.floor(Math.random() * 13) + 1;

      if (check_duplication(random_card[0], random_card[1])) {
        i--;
        continue;
      }
      memory_mark.push(random_card[0])
      memory_num.push(random_card[1])
      // 重複チェック用の変数に保存
      cards[cards.length] =  card_generate(change_mark(random_card[0]), random_card[1]);　// ここまで１枚目
      while (true) {
        if (error_check > 100) {
          reset();
          error_check = 0;
          return;
        }
        error_check++
        random_card[0] = Math.floor(Math.random() * 4)
        if (!check_duplication(random_card[0], random_card[1])) {
          break;
        }
      }
      memory_mark.push(random_card[0]);
      memory_num.push(random_card[1]);
      cards[cards.length] =  card_generate(change_mark(random_card[0]), random_card[1]);
      // 記号だけ変更して２枚目作成
    }
    var i = 0
    while (cards.length) {
      var pos = Math.floor(Math.random() * cards.length);
      stage.appendChild(cards.splice(pos, 1)[0]);
      // 配列の要素を削除して削除したものを配列で返す　splice(開始するインデックス番号, 何個削除するか, ３番目以降の値を追加するとそれを配列に加える)
      // この場合要素が1つの配列なので[0]
      stage.children[i].children[0].dataset.index = String(i);
      i++
    }
  }

  function call_npc() {setTimeout(function () {
    if (error_check > 100) {
      for (var key in npc_d_memorys) {
        delete npc_d_memorys[key];
        error_check = 0
        // ペア用変数初期化
      }
    }
    error_check++
    npc();
    // 無限ループ脱出用
  }, 10);}

  function npc() {
    console.log('npc')
    if (Object.keys(npc_d_memorys).length <= 1) {
      for (var key in npc_d_memorys) {
        delete npc_d_memorys[key];
        // ペア用変数が要素1つのみだとハマるので全削除
      }
    }
    var random_card
    var cards = document.getElementsByClassName('card');
    if (match_end) {return;}
    if (Object.keys(npc_d_memorys).length >= 2 && Math.floor(Math.random() * 100) < level + 40 + player_winCount + npc_winCount) {
      // 一枚ごとに確率で正答
      if (firstCard === null) {
        random_card = Math.floor(Math.random() * Object.keys(npc_d_memorys).length)
        var i = 0
        for (var key in npc_d_memorys) {
          if (i === random_card) {
            random_card = Number(key);
            break;
          }
          i++;
        }
        setTimeout(function() {
          open_card(cards[random_card]);
        },800)
      } else {
        random_card = Math.floor(Math.random() * Object.keys(npc_d_memorys).length)
        var i = 0
        for (var key in npc_d_memorys) {
          if (i === random_card && key !== firstCard.dataset.index && npc_d_memorys[key] === firstCard.dataset.num) {
            random_card = Number(key);
            setTimeout(function() {
            open_card(cards[random_card]);
            },800)
            return;
          }
          i++;
        }
      call_npc();
      }
    } else {
      while (true) {
        if (error_check > 100) {
          call_npc();
          error_check = 0;
          return;
        }
        random_card = Math.floor(Math.random() * cards.length);
        if (cards[random_card].className.indexOf('open') === -1) {
          setTimeout(function() {
            open_card(cards[random_card]);
          },800)
          return;
        }
        error_check++;
      }
    }
  }

  start.addEventListener('click', function() {
    if (game_started) {return;}
    game_started = true;
    input_container.className = 'hide';
    message_container.className = 'hide';
    message.innerHTML = 'あなたの得点: * CPUの得点: +'.replace('*', player_winCount).replace('+', npc_winCount);
    setTimeout(function () {
      input_container.className = 'none'
    }, 500);
    init();
    setTimeout(function() {
      message_container.className = 'display'
      for (var i = 0; i < level * 2; i++)
      stage.children[i].className = 'card-container display'
    }, 500)
  })

  restart.addEventListener('click', function() {
    if (restarted) {return;}
    restarted = true;
    stage.className = 'hide';
    message_container.className = 'hide';
    setTimeout(function () {
      input_container.className = 'hide';
      while (stage.firstChild) stage.removeChild(stage.firstChild);
      setTimeout(function () {
        input_container.className = 'display';
        setTimeout(function () {
          game_started = false;
          restarted = false;
        }, 800);
      }, 100);
      stage.className = 'display';
    }, 500);
  })

  slider.addEventListener('change', function() {
    label.innerHTML = this.value;
  })

})();
