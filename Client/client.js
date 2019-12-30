// Main variables

let port = process.env.PORT || 3000;

let website_url = "http://localhost:" + port;

let mainContainer = document.getElementById('main_container');

// Member variables

let connected = false;

let memberName = "test";

// Network variables

let socket;

let socketId;

let characterServerId = 0;

let characterId = 200;

// Connexion

socket = io.connect(website_url);

socket.on('socketId_send', function(data){

  socketId = data;

});

// Login screen

mainContainer.innerHTML =
`

  <div id = 'login_container'>

    <div id = 'login_input_container'>

      <select class = 'input_field' id="login_charServer">
        <option value="0">Server 1</option>
      </select>

      <input class = 'input_field' type = "text" id = 'login_charName' placeholder = 'Character name...'></input>

      <input class = 'input_field' type = "password" id = 'login_pw' placeholder = 'Password...'></input>

      <div id = 'login_try_infos'></div>

      <div class = 'button' id = 'login_submit'>LOGIN</div>

    </div>

  </div>

`
;

document.getElementById('login_submit').addEventListener('click', function(){

  document.getElementById('login_submit').innerHTML = '<div class="loader"></div>';
  document.getElementById('login_submit').style.border = "0px solid white";

  // Try to connect

  let inpServ = document.getElementById('login_charServer').value;
  let inpName = document.getElementById('login_charName').value;
  let inpPw = document.getElementById('login_pw').value;

  socket.emit('checkLogin', [inpServ, inpName, inpPw]);

  socket.on('checkLogin_response', function(data){

    if(data[0] == 0 || data[0] == 2)
    {

      document.getElementById('login_try_infos').innerHTML = "Character not found or wrong password";

      document.getElementById('login_submit').innerHTML = 'LOGIN';
      document.getElementById('login_submit').style.border = "3px solid rgba(255, 255, 255, 0.7)";

    }

    if(data[0] == 1)
    {

      document.getElementById('login_try_infos').innerHTML = "This character is already connected";

      document.getElementById('login_submit').innerHTML = 'LOGIN';
      document.getElementById('login_submit').style.border = "3px solid rgba(255, 255, 255, 0.7)";

    }

    if(data[0] == 3)
    {

      characterServerId = inpServ;
      characterId = data[1];

      mainContainer.innerHTML = '';

      connectToGame();

    }

  });

});

// Character temp variables

let characterName;

let characterCharsetId;

let characterWorldPosition;

let characterDirection = 0;

let characterActionState = 0;  // 0 : idle, 1 : moving, 2 : attack

let characterStats;

let characterAssignedSpells = [0, 999, 999, 999, 999, 999, 999, 999, 999, 999];

// Objects variables

let objectsType = [];   // 0 : player, 1 : enemy, 2 : npc, 3 : fx, 4 : field, 5 : item

let objectsName = [];

let objectsCharsetId = [];

let objectsPosition = [];

let objectsDirection = [];    // 0 : horizontal axis, 1 : vertical axis

let objectsActionState = [];  // 0 : idle, 1 : moving, 2 : attack

let objectsStats = [];

let receivingDatas = false;

function giveCharLvlInfo(xp, info)
{

  let result = 0;

  let lvl = Math.floor(Math.pow(xp / 500, 2/3));

  if(info == "lvl")
  {
    result = lvl + 1;
  }

  if(info == "filled")
  {
    result = (xp - Math.floor(500 * Math.pow(lvl, 1.5))) / (Math.floor(500 * Math.pow(lvl + 1, 1.5)) - Math.floor(500 * Math.pow(lvl, 1.5)));
  }

  if(info == "next")
  {
    result = Math.floor(500 * Math.pow(lvl + 1, 1.5)) - xp;
  }

  return result;

}

// Check connection state

let automaticFunctionsRate = 25;

function connectToGame()
{

  // Initiate socket connection

  initiateSocketConnection();

  function initiateSocketConnection()
  {

    socket.on('send_charNamePos', function(data){

      characterName = data[0];
      characterWorldPosition = data[1];
      characterStats = data[2];
      characterCharsetId = data[3];

      // Initiate Automatic Functions

      let sendMyDatas = setInterval( function(){

        let temp =
        [

          characterServerId,
          characterId,
          characterWorldPosition,
          characterDirection,
          characterActionState

        ];

        socket.emit('sendMyDatas', temp);

      }, automaticFunctionsRate);

      let getAroundObjectsDatas = setInterval( function(){

        let temp = [
          characterServerId,
          characterWorldPosition,
          [window.screen.width, window.screen.height]
        ];

        socket.emit('getAroundObjectsDatas', temp);

      }, automaticFunctionsRate);

    });

    socket.emit('send_serverCharId', [characterServerId, characterId]);

  }

  // Initiate HUD

  initiateHUD();

  function initiateHUD()
  {

    // Initiate Chatbox

    initiateChatbox();

    function initiateChatbox()
    {

      // Creating chatbox

      mainContainer.innerHTML +=
      `

        <div id = "chatbox_container">

          <div id = "chatbox_messages_div">

          </div>

          <div id = "chatbox_inputfield_div">

            <input type = "text" id = "chatbox_inputfield" placeholder = "Enter your message..."></input>

          </div>

        </div>

      `
      ;

      // Send get_messages query

      let chatboxGetMessages_interval = setInterval( function(){

        socket.emit('chatbox_get_messages', characterServerId);

      }, 100);

      // Listen to get_messages query results

      socket.on('chatbox_get_messages_response', function(data){

        let finalHTML = '';

        for(let i = 0; i < data.length; i++)
        {

          if(data[i][0] == characterName)
          {

            finalHTML +=

            "<div class = 'chatbox_messages_messagesBlock_author' >";

          }
          else
          {

            finalHTML +=

            "<div class = 'chatbox_messages_messagesBlock_others' >";

          }

          finalHTML +=

          "<span class = 'chatbox_author_style' >" + data[i][0] + "</span><span class = 'chatbox_content_style'> : " +
          data[i][1] + "</span></div>";

        }

        document.getElementById('chatbox_messages_div').innerHTML = finalHTML;

      });

    }

    // Message box

    mainContainer.innerHTML +=
    `
      <div id = 'message_box'><div id = 'message_content'></div></div>
    `;

    if(window.screen.width > 512)
    {
      document.getElementById('message_box').style.left = (window.screen.width - 512) / 2 + "px";
    }

    // Initialize buttons

    mainContainer.innerHTML +=

    `

      <div id = 'menu_buttons_bar'>

        <div class = 'menu_buttons_buttons' id = 'menu_charInfo_button'>
          <img src = 'graphics/ui/menu_buttons_charInfo_icon.png' title = 'Character infos'>
        </div>

      </div>

    `
    ;

    // Initialize character info

    mainContainer.innerHTML +=

    `

      <div id = 'menu_right_container'>

      </div>

    `
    ;

    // Listeners

    let refreshCharInfosData;

    document.getElementById('menu_charInfo_button').addEventListener('click', function(){

      document.getElementById('menu_right_container').style.width = "17%";
      document.getElementById('menu_right_container').style.display = "flex";

      document.getElementById('menu_right_container').innerHTML =


        "<div class = 'menu_right_title' id = 'menu_charInfo_title'>" +

          "CHARACTER INFOS" +

        "</div>" +

        "<div class = 'menu_right_content' id = 'menu_charInfo_content'>" +

          "<div id = 'menu_charInfo_header'>" +

          "</div>" +

          "<div id = 'menu_charInfo_stats'>" +

            "<div id = 'menu_charInfo_stats_names'>" +
            "<div>HP</div><div>KI</div><div>Force</div><div>Defense</div><div>Energy</div><div>Spirit</div><div>Speed</div>" +
            "</div>" +

            "<div id = 'menu_charInfo_stats_stats'>" +
            "</div>" +

            "<div id = 'menu_charInfo_stats_plus'>" +
            "</div>" +

          "</div>" +

          "<div id = 'menu_charInfo_footer'>" +

          "</div>" +

        "</div>"
      ;

      refreshCharInfosData = setInterval(function(){

        document.getElementById('menu_charInfo_header').innerHTML =
              characterName + " Lvl." + giveCharLvlInfo(characterStats[9], "lvl");

        document.getElementById('menu_charInfo_stats_stats').innerHTML =
          "<div>" + characterStats[1] + " / " + characterStats[0] + "</div>" +
          "<div>" + characterStats[3] + " / " + characterStats[2] + "</div>" +
          "<div>" + characterStats[4] + "</div>" +
          "<div>" + characterStats[5] + "</div>" +
          "<div>" + characterStats[6] + "</div>" +
          "<div>" + characterStats[7] + "</div>" +
          "<div>" + characterStats[8] + "</div>";

        document.getElementById('menu_charInfo_stats_plus').innerHTML = '';

        if(characterStats[10] > 0)
        {

          for(let i = 0; i < 7; i++)
          {
              document.getElementById('menu_charInfo_stats_plus').innerHTML +=
              "<div class = 'stat_boost_point' id = 'stat_boost_point_" + i + "'><img src = 'graphics/ui/stat_boost_point.png'></div>";
          }

          document.getElementById('stat_boost_point_0').addEventListener('mousedown', function(){

            socket.emit('level_up_stat', [characterServerId, characterId, 0]);

          });

          document.getElementById('stat_boost_point_1').addEventListener('mousedown', function(){

            socket.emit('level_up_stat', [characterServerId, characterId, 1]);

          });

          document.getElementById('stat_boost_point_2').addEventListener('mousedown', function(){

            socket.emit('level_up_stat', [characterServerId, characterId, 2]);

          });

          document.getElementById('stat_boost_point_3').addEventListener('mousedown', function(){

            socket.emit('level_up_stat', [characterServerId, characterId, 3]);

          });

          document.getElementById('stat_boost_point_4').addEventListener('mousedown', function(){

            socket.emit('level_up_stat', [characterServerId, characterId, 4]);

          });

          document.getElementById('stat_boost_point_5').addEventListener('mousedown', function(){

            socket.emit('level_up_stat', [characterServerId, characterId, 5]);

          });

          document.getElementById('stat_boost_point_6').addEventListener('mousedown', function(){

            socket.emit('level_up_stat', [characterServerId, characterId, 6]);

          });

        }

        document.getElementById('menu_charInfo_footer').innerHTML =
          "<div> Exp : " + characterStats[9] + " / " + (characterStats[9] + giveCharLvlInfo(characterStats[9], "next")) + "</div>" +
          "<div> Stats boost points : " + characterStats[10] + "</div>";

      }, automaticFunctionsRate);

    });

    document.getElementById('menu_right_container').addEventListener('click', function(){

      document.getElementById('menu_right_container').style.width = "0px";
      document.getElementById('menu_right_container').style.display = "none";
      document.getElementById('menu_right_container').innerHTML = '';
      clearInterval(refreshCharInfosData);

    });

  }

  // Initialize input

  InitializeInput();

  function InitializeInput()
  {

    window.addEventListener('keydown', function(event){

      // Action

      if(event.keyCode == 32 )
      {

        characterActionState = 2;

      }

      // Directional arrows

      if(event.keyCode == 90 || event.keyCode == 38)
      {

        // Move top

        characterActionState = 1;
        characterDirection = 3;
        characterVelocity[3] = 1;

      }

      if(event.keyCode == 81 || event.keyCode == 37)
      {

        // Move left

        characterActionState = 1;
        characterDirection = 1;
        characterVelocity[1] = 1;

      }

      if(event.keyCode == 68 || event.keyCode == 39)
      {

        // Move right

        characterActionState = 1;
        characterDirection = 2;
        characterVelocity[2] = 1;

      }

      if(event.keyCode == 83 || event.keyCode == 40)
      {

        // Move bottom

        characterActionState = 1;
        characterDirection = 0;
        characterVelocity[0] = 1;

      }

      // Spells, 1 to 0

      if(event.keyCode == 49)
      {
        if(characterAssignedSpells[0] != 999)
        {
          socket.emit('launchSpell', [characterServerId, characterCharsetId, characterAssignedSpells[0]]);
          characterActionState = 3;
        }
      }

      if(event.keyCode == 50)
      {
        if(characterAssignedSpells[1] != 999)
        {
          socket.emit('launchSpell', [characterServerId, characterCharsetId, characterAssignedSpells[1]]);
          characterActionState = 3;
        }
      }

      if(event.keyCode == 51)
      {
        if(characterAssignedSpells[2] != 999)
        {
          socket.emit('launchSpell', [characterServerId, characterCharsetId, characterAssignedSpells[2]]);
          characterActionState = 3;
        }
      }

      if(event.keyCode == 52)
      {
        if(characterAssignedSpells[3] != 999)
        {
          socket.emit('launchSpell', [characterServerId, characterCharsetId, characterAssignedSpells[3]]);
          characterActionState = 3;
        }
      }

      if(event.keyCode == 53)
      {
        if(characterAssignedSpells[4] != 999)
        {
          socket.emit('launchSpell', [characterServerId, characterCharsetId, characterAssignedSpells[4]]);
          characterActionState = 3;
        }
      }

      if(event.keyCode == 54)
      {
        if(characterAssignedSpells[5] != 999)
        {
          socket.emit('launchSpell', [characterServerId, characterCharsetId, characterAssignedSpells[5]]);
          characterActionState = 3;
        }
      }

    });

    window.addEventListener('keyup', function(event){

      // Action

      if(event.keyCode == 32 || event.keyCode == 49 || event.keyCode == 50 || event.keyCode == 51 || event.keyCode == 52
      || event.keyCode == 53 || event.keyCode == 54)
      {

        characterActionState = 0;

      }

      // Directional arrows

      if(event.keyCode == 90 || event.keyCode == 38)
      {

        // Move top

        characterVelocity[3] = 0;

        if(characterVelocity[0] == 0 && characterVelocity[1] == 0 && characterVelocity[2] == 0 && characterVelocity[3] == 0)
        {
          characterActionState = 0;
        }
        else
        {
          for(let i = 0; i < characterVelocity.length; i++)
          {

            if(characterVelocity[i] == 1)
            {
              characterDirection = i;
            }

          }
        }

      }

      if(event.keyCode == 81 || event.keyCode == 37)
      {

        // Move left

        characterVelocity[1] = 0;

        if(characterVelocity[0] == 0 && characterVelocity[1] == 0 && characterVelocity[2] == 0 && characterVelocity[3] == 0)
        {
          characterActionState = 0;
        }
        else
        {
          for(let i = 0; i < characterVelocity.length; i++)
          {

            if(characterVelocity[i] == 1)
            {
              characterDirection = i;
            }

          }
        }

      }

      if(event.keyCode == 68 || event.keyCode == 39)
      {

        // Move right

        characterVelocity[2] = 0;

        if(characterVelocity[0] == 0 && characterVelocity[1] == 0 && characterVelocity[2] == 0 && characterVelocity[3] == 0)
        {
          characterActionState = 0;
        }
        else
        {
          for(let i = 0; i < characterVelocity.length; i++)
          {

            if(characterVelocity[i] == 1)
            {
              characterDirection = i;
            }

          }
        }

      }

      if(event.keyCode == 83 || event.keyCode == 40)
      {

        // Move bottom

        characterVelocity[0] = 0;

        if(characterVelocity[0] == 0 && characterVelocity[1] == 0 && characterVelocity[2] == 0 && characterVelocity[3] == 0)
        {
          characterActionState = 0;
        }
        else
        {
          for(let i = 0; i < characterVelocity.length; i++)
          {

            if(characterVelocity[i] == 1)
            {
              characterDirection = i;
            }

          }
        }

      }

    });

  }

  // Listen to

    // getAroundObjectsDatas response

  socket.on('getAroundObjectsDatas_response', function(data){

    objectsType = [];
    objectsName = [];
    objectsCharsetId = [];
    objectsPosition = [];
    objectsDirection = [];
    objectsActionState = [];
    objectsStats = [];

    for(let i = 0; i < data.length; i++)
    {

      objectsType.push(data[i][0]);
      objectsName.push(data[i][1]);
      objectsCharsetId.push(data[i][2]);
      objectsPosition.push(data[i][3]);
      objectsDirection.push(data[i][4]);
      objectsActionState.push(data[i][5]);
      objectsStats.push(data[i][6]);

    }

    receivingDatas = true;

  });

    // messages

  socket.on('message', function(data){

    document.getElementById('message_box').style.display = "flex";

    document.getElementById('message_content').innerHTML = data;

  });


      document.getElementById('message_box').addEventListener('click', function(){
        document.getElementById('message_box').style.display = "none";
      });

    // message input field

  document.getElementById('chatbox_inputfield').addEventListener('keydown', function(event){

    if(event.keyCode == 13)
    {

      let message_datas =
      [

        characterServerId,
        characterName,
        document.getElementById('chatbox_inputfield').value

      ];

      console.log("yes");

      socket.emit('chatbox_send_message', message_datas);

      document.getElementById('chatbox_inputfield').value = "";

      document.getElementById('chatbox_messages_div').scrollTop =
      document.getElementById('chatbox_messages_div').scrollHeight;

    }

  });

  connected = true;

}

// Animation

let spriteAnimId = 0;

let spriteAnimIncrTimer = 0;

let spriteAnimIncrRate = 5;

let spriteAnimSequences = // 0 : idle, 1 : moving, 2 : attack
[
  [0,0,0,0],
  [2,3,4,5],
  [6,7,0,0],
  [7,7,7,7]
];

function animSprites()
{

  spriteAnimIncrTimer++;

  if(spriteAnimIncrTimer > spriteAnimIncrRate)
  {

    if(spriteAnimId < 3)
    {
      spriteAnimId++;
    }
    else
    {
      spriteAnimId = 0;
    }

    spriteAnimIncrTimer = 0;

  }

}

function moveCharacter()
{

  if(characterActionState == 1)
  {

    let dX = characterVelocity[2] + (-characterVelocity[1]);
    let dY = characterVelocity[0] + (-characterVelocity[3]);

    if(dX * dY != 0)
    {
      dX *= Math.pow(2, 0.5) / 2;
      dY *= Math.pow(2, 0.5) / 2;
    }

    characterWorldPosition[0] += dX * realSpeed;
    characterWorldPosition[1] += dY * realSpeed;

  }

}

function manageBasicAttack()
{

  if(characterActionState == 2 && spriteAnimId == 1 && spriteAnimIncrTimer == 1)
  {

    socket.emit('attack', [
      characterServerId,
      characterId
    ]);

  }

}

// Graphics variables

  // Images

let canvas;

let ui_lifeBarBack;

let ui_lifeBarJauge;

let ui_lifeBarJauge_npc;

let ui_xpBarBack;

let ui_xpBarJauge;

let ui_available_quest_icon;

let ui_reward_quest_icon;

let charsets = [];

  // Physics

let realSpeed = 2;

let speedAccel = 0.1;

let characterVelocity = [0,0,0,0];

function preload()
{

  // UI

  ui_lifeBarBack = loadImage("graphics/ui/life_bar_back.png");

  ui_lifeBarJauge = loadImage("graphics/ui/life_bar_jauge.png");

  ui_lifeBarJauge_npc = loadImage("graphics/ui/life_bar_jauge_npc.png");

  ui_xpBarBack = loadImage("graphics/ui/xp_bar_back.png");

  ui_xpBarJauge = loadImage("graphics/ui/xp_bar_jauge.png");

  ui_available_quest_icon = loadImage('graphics/ui/availaible_quest.png');

  ui_reward_quest_icon = loadImage('graphics/ui/reward_quest.png');

  // Charsets

  charsets.push(loadImage("graphics/map/field.png"));
  charsets.push(loadImage("graphics/characters/sprite_goku.png"));
  charsets.push(loadImage("graphics/characters/sprite_vegeta.png"));
  charsets.push(loadImage("graphics/fx/fx_kikoha.png"));
  charsets.push(loadImage("graphics/characters/sprite_piccolo.png"));
  charsets.push(loadImage("graphics/enemies/sprite_radditz.png"));    // 5
  charsets.push(loadImage("graphics/npc/sprite_chiaozu.png"));
  charsets.push(loadImage("graphics/enemies/sprite_dodo.png"));

}

function setup()
{

  frameRate(30);

  canvas = createCanvas(windowWidth, windowHeight);

  canvas.position(0,0);

  textAlign(CENTER, CENTER);

}

function windowResized()
{

   resizeCanvas(windowWidth, windowHeight);

}

function draw()
{

  if(connected && receivingDatas)
  {

    background(50);

    animSprites();

    moveCharacter();

    manageBasicAttack();

    // Draw objects

    for(let i = 0; i < objectsType.length; i++)
    {

      // Calculate local position

      let objectLocalPos;

      if(objectsName[i] == characterName && objectsType[i] == 0)
      {

        objectLocalPos = [window.width / 2 - 16, window.height / 2 - 48];
        characterStats = objectsStats[i];

      }
      else
      {

        objectLocalPos =
        [
        objectsPosition[i][0] - characterWorldPosition[0] + window.width / 2 - 16,
        objectsPosition[i][1] - characterWorldPosition[1] + window.height / 2 - 48
        ];

      }

      // Draw

      if(objectsType[i] != 4)
      {

          image(charsets[objectsCharsetId[i]], objectLocalPos[0], objectLocalPos[1], 32, 48,
            spriteAnimSequences[objectsActionState[i]][spriteAnimId] * 32, objectsDirection[i] * 48, 32, 48);

      }
      else
      {

        image(charsets[objectsCharsetId[i]], objectLocalPos[0], objectLocalPos[1]);

      }

    }

    for(let i = 0; i < objectsType.length; i++)
    {

      // Calculate local position

      let objectLocalPos;

      if(objectsName[i] == characterName && objectsType[i] == 0)
      {

        objectLocalPos = [window.width / 2 - 16, window.height / 2 - 48];

      }
      else
      {

        objectLocalPos =
        [
        objectsPosition[i][0] - characterWorldPosition[0] + window.width / 2 - 16,
        objectsPosition[i][1] - characterWorldPosition[1] + window.height / 2 - 48
        ];

      }

      // Draw

      if(objectsType[i] != 4)
      {

            if(objectsType[i] == 0 || objectsType[i] == 1 || objectsType[i] == 2)
            {

              // UI

              if( objectsType[i] == 2)
              {

                // Quest icon

                if(objectsStats[i][1] == 1)
                {
                  image(ui_available_quest_icon, objectLocalPos[0] + 5, objectLocalPos[1] - 48);
                }

                if(objectsStats[i][1] == 2)
                {
                  image(ui_reward_quest_icon, objectLocalPos[0] + 5, objectLocalPos[1] - 48);
                }

              }

                // Name

              textAlign(CENTER, CENTER);
              fill(255,255,255);
              text(objectsName[i], objectLocalPos[0] + 16, objectLocalPos[1] - 6);

                // Lifebar

              image(ui_lifeBarBack, objectLocalPos[0] - 20, objectLocalPos[1] );

              if(objectsType[i] == 0 || objectsType[i] == 1)
              {

                if(objectsStats[i][1] > 0)
                {

                    // Calculate portion of jauge displayed

                  let jaugeDispX = 66 * objectsStats[i][1] / objectsStats[i][0] ;

                  image(ui_lifeBarJauge, objectLocalPos[0] - 17, objectLocalPos[1] + 3, jaugeDispX, 6);

                }

              }
              else
              {
                image(ui_lifeBarJauge_npc, objectLocalPos[0] - 17, objectLocalPos[1] + 3, 66, 6);
              }

            }

      }

    }

    // Ui

    image(ui_xpBarBack, 20, 70);

    if( giveCharLvlInfo(characterStats[9], "filled") > 0)
    {

        // Calculate portion of jauge displayed

      let jaugeDispX = 249 * giveCharLvlInfo(characterStats[9], "filled");

      image(ui_xpBarJauge, 20 + 32, 73, jaugeDispX, 6);

    }

  }

}
