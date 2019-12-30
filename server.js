// Initialization

console.log("Starting server");

let express = require('express');

let app = express();

let port = process.env.PORT || 3000;

let server = app.listen(port);

console.log("listening on " + port);

app.use(express.static('Client'));

let socket = require('socket.io');

let io = socket(server);

// Servers variables

let serverNumber = 1;

let maxMessagesNumber = 5;

let maxCharactersPerServer = 500;

let maxSpellsPerServer = 2500;

let maxEnemiesSpecePerServer = 20;

// Members variables

let chatbox_messages_array = new Array(serverNumber); // A : server id, B : message id, C : messages datas,
  // 0 : socket id, 1 : sender name, 2 : content, 3 : date

  for(let i = 0; i <  chatbox_messages_array.length; i++)
  {
     chatbox_messages_array[i] = [];
  }

// Quests

let questsStats =   // 0 : title, 1 : (enemies to kill, amount), 2 : (objects to farm, amount), 3 : npc,
//4 : description, 5 : pre req, 6 : xp reward, 7 : gold reward, 8 : item reward, 9 : lvl req
[

  'empty',

  ["Un Pauvre Fermier", [1,10], [0,0], 0,
  "Un fermier a été retrouvé mort ce matin. S'il a croisé Radditz, ce dernier ne doit pas être très loin.",
  0, 0, 20, 0, 1],

  ["Un Partenaire Inattendu", [2,1], [0,0], 0,
  "Piccolo souhaite s'entraîner une dernière fois avant d'aller affronter Radditz.",
  1, 0, 40, 0, 1],

  ["Un Vrai Combat Fratricide", [3,1], [0,0], 0,
  "Il est temps d'aller affronter Radditz. Essaie de ne pas mourrir.",
  2, 0, 50, 0, 1],

];

// Characters variables

let charactersConnectionState = new Array(serverNumber);

let charactersName = new Array(serverNumber);

let charactersPassword = new Array(serverNumber);

let charactersCharsetId = new Array(serverNumber);

let charactersPosition = new Array(serverNumber);

let charactersDirection = new Array(serverNumber);    // bottom, right, left, top

let charactersActionState = new Array(serverNumber);  // 0 : idle, 1 : moving, 2 : attack

let charactersStats = new Array(serverNumber);

let charactersQuestState = new Array(serverNumber);

let statProgression = [20,2];  // 0 : resources, 1 : other stats

let hpRegenRate = 1 / 100;

  // Fill characters variables with database

for(let i = 0; i <  charactersConnectionState.length; i++)
{

  charactersConnectionState[i] = new Array(maxCharactersPerServer);

      for(let j = 0; j < maxCharactersPerServer; j++)
      {
        charactersConnectionState[i][j] = 0;
      }

}

for(let i = 0; i <  charactersName.length; i++)
{

  charactersName[i] = new Array(maxCharactersPerServer);

     for(let j = 0; j < maxCharactersPerServer; j++)
     {
        charactersName[i][j] = 'test' + j;
     }

}

for(let i = 0; i <  charactersPassword.length; i++)
{

  charactersPassword[i] = new Array(maxCharactersPerServer);

     for(let j = 0; j < maxCharactersPerServer; j++)
     {
        charactersPassword[i][j] = 'test' + j;
     }

}

for(let i = 0; i <  charactersCharsetId.length; i++)
{

  charactersCharsetId[i] = new Array(maxCharactersPerServer);

     for(let j = 0; j < maxCharactersPerServer; j++)
     {
        charactersCharsetId[i][j] = 1;
     }

}

for(let i = 0; i <  charactersPosition.length; i++)
{

  charactersPosition[i] = new Array(maxCharactersPerServer);

     for(let j = 0; j < maxCharactersPerServer; j++)
     {
        charactersPosition[i][j] = [0, 0];
     }

}

for(let i = 0; i <  charactersDirection.length; i++)
{

  charactersDirection[i] = new Array(maxCharactersPerServer);

     for(let j = 0; j < maxCharactersPerServer; j++)
     {
        charactersDirection[i][j] = 0;
     }

}

for(let i = 0; i <  charactersActionState.length; i++)
{

  charactersActionState[i] = new Array(maxCharactersPerServer);

     for(let j = 0; j < maxCharactersPerServer; j++)
     {
        charactersActionState[i][j] = 0;
     }

}

for(let i = 0; i <  charactersStats.length; i++)
{

  charactersStats[i] = new Array(maxCharactersPerServer);

     for(let j = 0; j < maxCharactersPerServer; j++)
     {

        charactersStats[i][j] =
        [100, 100, 100, 100, 10, 0, 10, 0, 10, 0, 0];

        // 0 : max hp, 1 : current hp, 2 : max mp, 3 : current mp, 4 : force, 5 : def, 6 : magic,
        // 7 : mag def, 8 : speed, 9 : xp, 10 : stat boost points

     }

}

for(let i = 0; i <  charactersQuestState.length; i++)
{

  charactersQuestState[i] = new Array(maxCharactersPerServer);

     for(let j = 0; j < maxCharactersPerServer; j++)
     {

        charactersQuestState[i][j] = new Array(questsStats.length);

        charactersQuestState[i][j][0] = 1;

        for(let k = 1; k < charactersQuestState[i][j].length; k++)
        {
          charactersQuestState[i][j][k] = 0; // 0 : available, 1 : in process, 2 : reward, 3 : done
        }

     }

}

// Spells

let spellsSpece = new Array(serverNumber);

let spellsPosition = new Array(serverNumber);

let spellsDirection = new Array(serverNumber);

let spellsActionState = new Array(serverNumber); // 0 : birth, 1 : life, 2 : death

let spellsOwner = new Array(serverNumber);

let spellsDmg = new Array(serverNumber);

let spellsLifeTimer = new Array(serverNumber);

let spellsDBstats =
[
  ["Kikoha", 3, false, 2, [0,0.5], 20, 4] // 0 : name, 1 : charset id, 2 : is continuous, 3 : type (neutral, physic, magic)
  // 4 : power (basic, ratio), 5 : speed (from 1 to 5), 6 : ki cost
];

let spellsLifeTime = 1000;

for(let i = 0; i <  spellsSpece.length; i++)
{

  spellsSpece[i] = new Array(maxSpellsPerServer);

  for(let j = 0; j < spellsSpece[i].length; j++)
  {
    spellsSpece[i][j] = 999;
  }

}

for(let i = 0; i <  spellsPosition.length; i++)
{
  spellsPosition[i] = new Array(maxSpellsPerServer);

  for(let j = 0; j < spellsSpece[i].length; j++)
  {
    spellsPosition[i][j] = [0,0];
  }
}

for(let i = 0; i <  spellsDirection.length; i++)
{
  spellsDirection[i] = new Array(maxSpellsPerServer);
  for(let j = 0; j < spellsSpece[i].length; j++)
  {
    spellsDirection[i][j] = 0;
  }
}

for(let i = 0; i <  spellsActionState.length; i++)
{
  spellsActionState[i] = new Array(maxSpellsPerServer);
  for(let j = 0; j < spellsSpece[i].length; j++)
  {
    spellsActionState[i][j] = 0;
  }
}

for(let i = 0; i <  spellsOwner.length; i++)
{
  spellsOwner[i] = new Array(maxSpellsPerServer);
  for(let j = 0; j < spellsSpece[i].length; j++)
  {
    spellsOwner[i][j] = 999;
  }
}

for(let i = 0; i <  spellsDmg.length; i++)
{
  spellsDmg[i] = new Array(maxSpellsPerServer);
  for(let j = 0; j < spellsSpece[i].length; j++)
  {
    spellsDmg[i][j] = 2;
  }
}

for(let i = 0; i <  spellsLifeTimer.length; i++)
{

  spellsLifeTimer[i] = new Array(maxSpellsPerServer);

  for(let j = 0; j < spellsLifeTimer[i].length; j++)
  {
    spellsLifeTimer[i][j] = 0;
  }

}

// Enemies variables

let enemiesSpece = new Array(serverNumber);

let enemiesPosition = new Array(serverNumber);

let enemiesDirection = new Array(serverNumber);    // bottom, right, left, top

let enemiesActionState = new Array(serverNumber);  // 0 : idle, 1 : moving, 2 : attack

let enemiesStats = new Array(serverNumber);

let enemiesTarget = new Array(serverNumber);

let enemiesRealSpeed = 2;

let enemiesBasicAttackRate = 10;

let enemiesBasicAttackTimer = 0;

    // DB

let enemiesNonQuantStats =
[

  ['Vegeta', 2, 2, [[-100,1000],[-100,1000]], 0 ],

  // 0 : name, 1 : level, 2 : charset id, 3 : area, 4 : nb

  ['Dodo', 1, 7, [[-1000,500],[-500,1000]], 20 ],

  ['Piccolo', 6, 4, [[500,1000],[-500,500]], 1 ],

  ['Raditz', 9, 5, [[-500,500],[-600,-800]], 1 ]

];

let enemiesDBStats =
[

  [100, 100, 100, 100, 10, 0, 10, 0, 10, 3000, 100], // O : test

  // 0 : max hp, 1 : current hp, 2 : max mp, 3 : current mp, 4 : force, 5 : def, 6 : magic,
  // 7 : mag def, 8 : speed, 9 : xp reward, 10 : gold reward

  [80, 80, 100, 100, 10, 0, 10, 0, 10, 300, 5], // 1 : dodo

  [300, 300, 100, 100, 15, 0, 10, 0, 10, 1500, 20], // 2 : piccolo

  [400, 100, 100, 100, 18, 0, 10, 0, 10, 2500, 25] // 3 : raditz

];

    // Spawn

for(let i = 0; i <  enemiesSpece.length; i++)
{

  enemiesSpece[i] = new Array();
  enemiesPosition[i] = new Array();
  enemiesDirection[i] = new Array();
  enemiesActionState[i] = new Array();
  enemiesStats[i] = new Array();
  enemiesTarget[i] = new Array();

     for(let j = 0; j < enemiesDBStats.length; j++)
     {

       for(let k = 0; k < enemiesNonQuantStats[j][4]; k++)
       {

         enemiesSpece[i].push(j);
         enemiesPosition[i].push
         (
           [
             Math.round( enemiesNonQuantStats[j][3][0][0] + Math.random() * (enemiesNonQuantStats[j][3][0][1] -
               enemiesNonQuantStats[j][3][0][0]) ),
             Math.round( enemiesNonQuantStats[j][3][1][0] + Math.random() * (enemiesNonQuantStats[j][3][1][1] -
               enemiesNonQuantStats[j][3][1][0]) )
           ]
         );
         enemiesDirection[i].push(0);
         enemiesActionState[i].push(0);
         let temp = enemiesDBStats[j].slice();
         enemiesStats[i].push(temp);
         enemiesTarget[i].push(999);

       }

     }

}

// NPC

let npcsName = new Array(serverNumber);

for(let i = 0; i < npcsName.length; i++)
{
  npcsName[i] =
  [
    "Chiaotzu"
  ];
}

let npcsCharsetId = new Array(serverNumber);

for(let i = 0; i < npcsCharsetId.length; i++)
{
  npcsCharsetId[i] =
  [
    6
  ];
}

let npcsPosition = new Array(serverNumber);

for(let i = 0; i < npcsPosition.length; i++)
{
  npcsPosition[i] =
  [
    [200,30]
  ];
}

let npcsDirection = new Array(serverNumber);

for(let i = 0; i < npcsDirection.length; i++)
{
  npcsDirection[i] =
  [
    0
  ];
}

let npcsActionState = new Array(serverNumber);

for(let i = 0; i < npcsActionState.length; i++)
{
  npcsActionState[i] =
  [
    0
  ];
}

let npcsStats = new Array(serverNumber);

for(let i = 0; i < npcsStats.length; i++)
{
  npcsStats[i] =
  [

      ["Hey, Tien et les autres m'ont dit de venir te guider pour le début de ton aventure.", 0, [1,2,3]]

      // 0 : dialogue, 1 : quest state (0 : none, 1 : available, 2 : reward), 2 : quests

  ];
}

// Functions

function isClose(userPosition, targetPosition, onScreen, screenSize)
{

  result = false;

  let range = [24,24];

  if(onScreen)
  {
    range = [screenSize[0] / 2, screenSize[1] / 2];
  }

  if(targetPosition[0] < userPosition[0] + range[0] && targetPosition[0] > userPosition[0] - range[0]
  && targetPosition[1] < userPosition[1] + range[1] && targetPosition[1] > userPosition[1] - range[1])
  {
    result = true;
  }

  return result;

}

// Automatic functions

let automaticFunctionsRate = 1000;

let auto_clearChatMessagesArray = setInterval(function(){

  for(let i = 0; i < chatbox_messages_array.length; i++)
  {

    if(chatbox_messages_array[i].length > maxMessagesNumber)
    {

      let temp = chatbox_messages_array[i].slice(chatbox_messages_array[i].length - maxMessagesNumber, maxMessagesNumber + 1);

      chatbox_messages_array[i] = temp;

    }

  }

}, automaticFunctionsRate);

let auto_hpRegen = setInterval(function(){

  for(let i = 0; i < charactersStats.length; i++)
  {

    for(let j = 0; j < charactersStats[i].length; j++)
    {

      if(charactersStats[i][j][1] < charactersStats[i][j][0])
      {

        if(charactersStats[i][j][0] - charactersStats[i][j][1] > Math.floor(charactersStats[i][j][0] * hpRegenRate))
        {
          charactersStats[i][j][1] += Math.floor(charactersStats[i][j][0] * hpRegenRate);
        }
        else
        {
          charactersStats[i][j][1] = charactersStats[i][j][0];
        }

      }

      if(charactersStats[i][j][3] < charactersStats[i][j][2])
      {

        if(charactersStats[i][j][2] - charactersStats[i][j][3] > Math.floor(charactersStats[i][j][2] * hpRegenRate))
        {
          charactersStats[i][j][3] += Math.floor(charactersStats[i][j][2] * hpRegenRate);
        }
        else
        {
          charactersStats[i][j][3] = charactersStats[i][j][2];
        }

      }

    }

  }

  for(let i = 0; i < enemiesStats.length; i++)
  {

    for(let j = 0; j < enemiesStats[i].length; j++)
    {

      if(enemiesStats[i][j][1] < enemiesStats[i][j][0] && enemiesTarget[i][j] == 999)
      {

        if(enemiesStats[i][j][0] - enemiesStats[i][j][1] > Math.floor(enemiesStats[i][j][0] * hpRegenRate * 5))
        {
          enemiesStats[i][j][1] += Math.floor(enemiesStats[i][j][0] * hpRegenRate * 5);
        }
        else
        {
          enemiesStats[i][j][1] = enemiesStats[i][j][0];
        }

      }

      if(enemiesStats[i][j][3] < enemiesStats[i][j][2] && enemiesTarget[i][j] == 999)
      {

        if(enemiesStats[i][j][2] - enemiesStats[i][j][3] > Math.floor(enemiesStats[i][j][2] * hpRegenRate * 5))
        {
          enemiesStats[i][j][3] += Math.floor(enemiesStats[i][j][2] * hpRegenRate * 5);
        }
        else
        {
          enemiesStats[i][j][3] = enemiesStats[i][j][2];
        }

      }

    }

  }

}, automaticFunctionsRate);

let auto_spellsLife = setInterval(function(){

  for(let i = 0; i < spellsSpece.length; i++)
  {

    for(let j = 0; j < spellsSpece[i].length; j++)
    {

      spellsLifeTimer[i][j]++;

      if(spellsLifeTimer[i][j] > spellsLifeTime)
      {

        spellsSpece[i][j] = 999;

        spellsLifeTimer[i][j] = 0;

      }

      if(spellsSpece[i][j] != 999)
      {

        let speed = spellsDBstats[spellsSpece[i][j]][5];

        let dir = spellsDirection[i][j];

        spellsPosition[i][j][0] += speed * [(dir == 2) - (dir == 1)];

        spellsPosition[i][j][1] += speed * [(dir == 0) - (dir == 3)];

        for(let k = 0; k < enemiesSpece[i].length; k++)
        {

          let charDir = dir;

          let charPos = spellsPosition[i][j];

          let enemyPos = enemiesPosition[i][k];

          let own = spellsOwner[i][j];

          if(
            (charDir == 0 && enemyPos[0] < charPos[0] + 16 && enemyPos[0] > charPos[0] - 16
          && enemyPos[1] < charPos[1] + 32 && enemyPos[1] > charPos[1])
          ||
            (charDir == 2 && enemyPos[0] < charPos[0] + 32 && enemyPos[0] > charPos[0]
          && enemyPos[1] < charPos[1] + 16 && enemyPos[1] > charPos[1] - 16)
          ||
            (charDir == 1 && enemyPos[0] < charPos[0] && enemyPos[0] > charPos[0] - 32
          && enemyPos[1] < charPos[1] + 16 && enemyPos[1] > charPos[1] - 16)
          ||
            (charDir == 3 && enemyPos[0] < charPos[0] + 16 && enemyPos[0] > charPos[0] - 16
          && enemyPos[1] < charPos[1] && enemyPos[1] > charPos[1] - 48)
          )
          {

            let dmg = 2;

            if( spellsDmg[i][j] - enemiesStats[i][k][5] > 1)
            {
              dmg = spellsDmg[i][j] - enemiesStats[i][k][5];
            }

            if(enemiesStats[i][k][1] - dmg > 0)
            {
              enemiesStats[i][k][1] -= dmg;
            }
            else
            {

              // Give xp and gold

              let currentLvl = Math.floor(Math.pow(charactersStats[i][own][9] / 500, 2/3));

              charactersStats[i][own][9] +=
              enemiesDBStats[enemiesSpece[i][k]][9];

              let newLvl = Math.floor(Math.pow(charactersStats[i][own][9] / 500, 2/3));

              // Check if level up

              if( newLvl > currentLvl )
              {

                // Then lvl up

                charactersStats[i][own][10] += newLvl - currentLvl;

              }

              // Death et respawn

              enemiesStats[i][k][1] = enemiesStats[i][k][0];

              let id = enemiesSpece[i][k];

              enemiesPosition[i][k] =
              [
                Math.round( enemiesNonQuantStats[id][3][0][0] + Math.random() * (enemiesNonQuantStats[id][3][0][1] -
                  enemiesNonQuantStats[id][3][0][0]) ),
                Math.round( enemiesNonQuantStats[id][3][1][0] + Math.random() * (enemiesNonQuantStats[id][3][1][1] -
                  enemiesNonQuantStats[id][3][1][0]) )
              ];

              enemiesTarget[i][k] = 999;

            }

            if(charDir == 0)
            {
              enemiesDirection[i][k] = 3;
            }

            if(charDir == 1)
            {
              enemiesDirection[i][k] = 2;
            }

            if(charDir == 2)
            {
              enemiesDirection[i][k] = 1;
            }

            if(charDir == 3)
            {
              enemiesDirection[i][k] = 0;
            }

            enemiesTarget[i][k] = own;

            enemiesActionState[i][k] = 2;

            spellsSpece[i][j] = 999;

            spellsLifeTimer[i][j] = 0;

          }

        }

      }

    }

  }

}, automaticFunctionsRate / 10);

let auto_enemiesRandomMovement = setInterval(function(){

  enemiesBasicAttackTimer++;

  for(let i = 0; i < enemiesSpece.length; i++)
  {

    for(let j = 0; j < enemiesSpece[i].length; j++)
    {

      if(enemiesActionState[i][j] != 2)
      {

        if(enemiesActionState[i][j] == 1)
        {

          if(enemiesDirection[i][j] == 0)
          {
            enemiesPosition[i][j][1] += enemiesRealSpeed;
          }
          if(enemiesDirection[i][j] == 1)
          {
            enemiesPosition[i][j][0] -= enemiesRealSpeed;
          }
          if(enemiesDirection[i][j] == 2)
          {
            enemiesPosition[i][j][0] += enemiesRealSpeed;
          }
          if(enemiesDirection[i][j] == 3)
          {
            enemiesPosition[i][j][1] -= enemiesRealSpeed;
          }

        }

        // Change movement ?

        let changeMovement = Math.round(Math.random() * 20);

        if(changeMovement == 1)
        {

          // Move or idle ?

          let moveOrIdle = Math.round(Math.random() * 3);

          if(moveOrIdle > 1)
          {

            enemiesActionState[i][j] = 1;

            // What direction

            enemiesDirection[i][j] = Math.round(Math.random() * 3);

          }
          else
          {

            enemiesActionState[i][j] = 0;

          }

        }

      }
      else
      {

        if(enemiesTarget[i][j] != 999)
        {

          let targetPos = charactersPosition[i][enemiesTarget[i][j]];

          let myPos = enemiesPosition[i][j];

          if(targetPos[0] > myPos[0] + 32 || targetPos[0] < myPos[0] - 32 || targetPos[1] > myPos[1] + 32 ||
          targetPos[1] < myPos[1] - 32)
          {
            enemiesActionState[i][j] = 0;
            enemiesTarget[i][j] = 999;
          }

          if(enemiesBasicAttackTimer > enemiesBasicAttackRate && enemiesTarget[i][j] != 999 && enemiesTarget[i][j] != null)
          {

            enemiesBasicAttackTimer = 0;

            let dmg = 2;

            if(enemiesStats[i][j][4] - charactersStats[i][enemiesTarget[i][j]][5] > 1)
            {
              dmg = enemiesStats[i][j][4] - charactersStats[i][enemiesTarget[i][j]][5] ;
            }

            if(charactersStats[i][enemiesTarget[i][j]][1] - dmg > 0)
            {
              charactersStats[i][enemiesTarget[i][j]][1] -= dmg;
            }
            else
            {
              charactersStats[i][enemiesTarget[i][j]][1] = 0;
            }

          }

        }

      }

    }

  }

}, 100);

// On connection

function OnConnection(socket)
{

  console.log("A client tries to login");

  // Member network variables

  let socketId = socket.id;

  // Send socket id

  socket.emit('socketId_send', socketId);

  // Get infos

  socket.on('checkLogin', function(data){

    let serv = data[0];
    let name = data[1];
    let pw = data[2];

    // Find char id

    let charId;
    let found = false;

    for(let i = 0; i < charactersName[serv].length; i++)
    {
      if(charactersName[serv][i] == name)
      {
        charId = i;
        found = true;
        break;
      }
    }

    if(!found)
    {
      socket.emit('checkLogin_response', [0,'']); // 0 : not found, 1 : already connected, 2 : wrong password, 3 : success
    }
    else {

      // Check if already connected

      if(charactersConnectionState[serv][charId] == 1)
      {
        socket.emit('checkLogin_response', [1,'']);
      }
      else {

        // Check password

        if(charactersPassword[serv][charId] != pw)
        {
          socket.emit('checkLogin_response', [2,'']);
        }
        else {

          connectToGame(serv, charId);

          socket.emit('checkLogin_response', [3,charId]);

        }

      }

    }

  });

  function connectToGame(serv, char)
  {

    // Connect to game

    let connectedOnServerId = serv;

    let connectedOnCharId = char;

    socket.on('send_serverCharId', function(data){

      connectedOnServerId = data[0];
      connectedOnCharId = data[1];

      let temp = [
        charactersName[connectedOnServerId][connectedOnCharId],
        charactersPosition[connectedOnServerId][connectedOnCharId],
        charactersStats[connectedOnServerId][connectedOnCharId],
        charactersCharsetId[connectedOnServerId][connectedOnCharId]
      ];

      socket.emit('send_charNamePos', temp);

    charactersConnectionState[connectedOnServerId][connectedOnCharId] = 1;

      console.log("A client has connected to the game");

    });

    // On deconnection

    socket.on('disconnect', function()
    {

      charactersConnectionState[connectedOnServerId][connectedOnCharId] = 0;
      console.log("A client has disconnected");

    });

    // Listen to...

      // Chatbox messages

    socket.on('chatbox_send_message', function(data){

      let temp = [data[1], data[2]];

      chatbox_messages_array[data[0]].push(temp);

    });

      // Chatbox request

    socket.on('chatbox_get_messages', function(data){

        socket.emit('chatbox_get_messages_response', chatbox_messages_array[data]);

    });

      // Character datas

    socket.on('sendMyDatas', function(data) {

      charactersPosition[connectedOnServerId][connectedOnCharId] = data[2];
      charactersDirection[connectedOnServerId][connectedOnCharId] = data[3];
      charactersActionState[connectedOnServerId][connectedOnCharId] = data[4];

    });

      // Send objects datas reponse

    socket.on('getAroundObjectsDatas', function(data){

      let temp = [];    // first is object type

        // Field

      temp.push([

        4,
        'field',
        0,
        [-1600,-1600],
        0,
        0,
        new Array(10)

      ]);

        // Characters

      for(let i = 0; i < charactersName[data[0]].length; i++)
      {

        if(data[0] != null && data[1] != null && data[2] != null)
        {
          if( isClose(data[1], charactersPosition[data[0]][i], true, data[2]) &&
          charactersConnectionState[data[0]][i] == 1)
          {

            temp.push([

              0,
              charactersName[data[0]][i],
              charactersCharsetId[data[0]][i],
              charactersPosition[data[0]][i],
              charactersDirection[data[0]][i],
              charactersActionState[data[0]][i],
              charactersStats[data[0]][i]

            ]);

          }
        }

      }

        // Spells

      for(let i = 0; i < spellsSpece[data[0]].length; i++)
      {

        if(data[0] != null && data[1] != null && data[2] != null && spellsSpece[data[0]][i] != 999)
        {

          if( isClose(data[1], spellsPosition[data[0]][i], true, data[2]) )
          {

            temp.push([

              3,
              '',
              spellsDBstats[spellsSpece[data[0]][i]][1],
              spellsPosition[data[0]][i],
              spellsDirection[data[0]][i],
              spellsActionState[data[0]][i],
              [0,0,0,0,0,0,0,0,0]

            ]);

          }
        }

      }

        // Enemies

      for(let i = 0; i < enemiesSpece[data[0]].length; i++)
      {

          if(data[0] != null && data[1] != null && data[2] != null)
          {
            if( isClose(data[1], enemiesPosition[data[0]][i], true, data[2]))
            {

              temp.push([

                1,
                enemiesNonQuantStats[  enemiesSpece[ data[0] ][i]  ][0]
                + '  Lvl.' + enemiesNonQuantStats[  enemiesSpece[ data[0] ][i]  ][1],
                enemiesNonQuantStats[  enemiesSpece[ data[0] ][i]  ][2],
                enemiesPosition[data[0]][i],
                enemiesDirection[data[0]][i],
                enemiesActionState[data[0]][i],
                enemiesStats[data[0]][i]

              ]);

            }
          }

        }

        // NPCs

        let quest_state = 0;

        for(let i = 0; i < npcsName[data[0]].length; i++)
        {

            if(data[0] != null && data[1] != null && data[2] != null)
            {
              if( isClose(data[1], npcsPosition[data[0]][i], true, data[2]))
              {

                // Check if quest is available or reward

                let available_found = false;

                let reward_found = false;

                for(let j = 0; j < npcsStats[data[0]][i][2].length; j++)
                {

                  let quest_id = npcsStats[connectedOnServerId][i][2][j];

                  let charLvl = Math.floor(Math.pow(charactersStats[connectedOnServerId][connectedOnCharId][9] / 500, 2/3)) + 1;

                  if( charactersQuestState[connectedOnServerId][connectedOnCharId][quest_id] == 0 &&
                    charLvl >= questsStats[quest_id][9] && charLvl < questsStats[quest_id][9] + 10 )
                    {

                      // available

                      quest_state = 1;

                    }

                  for(let k = 0; k < charactersQuestState[connectedOnServerId][connectedOnCharId].length; k++)
                  {

                    if( charactersQuestState[connectedOnServerId][connectedOnCharId][k] == 3 && k == quest_id )
                    {

                      // reward

                      quest_state = 2;

                      break;

                    }

                  }

                }

                temp.push([

                  2,
                  npcsName[data[0]][i],
                  npcsCharsetId[data[0]][i],
                  npcsPosition[data[0]][i],
                  npcsDirection[data[0]][i],
                  npcsActionState[data[0]][i],
                  [npcsStats[data[0]][i], quest_state]

                ]);

              }
            }

          }

        // Send

        socket.emit('getAroundObjectsDatas_response', temp);

    });

      // Attack

    socket.on('attack', function(data){

      // Attack

      for(let i = 0; i < enemiesPosition[connectedOnServerId].length; i++)
      {

        let enemyPos = enemiesPosition[connectedOnServerId][i];

        let charPos = charactersPosition[connectedOnServerId][connectedOnCharId];

        let charDir = charactersDirection[connectedOnServerId][connectedOnCharId];

        let statsConc =
        [ charactersStats[connectedOnServerId][connectedOnCharId],
        enemiesStats[connectedOnServerId][i] ];

        if(
          (charDir == 0 && enemyPos[0] < charPos[0] + 16 && enemyPos[0] > charPos[0] - 16
        && enemyPos[1] < charPos[1] + 32 && enemyPos[1] > charPos[1])
        ||
          (charDir == 2 && enemyPos[0] < charPos[0] + 32 && enemyPos[0] > charPos[0]
        && enemyPos[1] < charPos[1] + 16 && enemyPos[1] > charPos[1] - 16)
        ||
          (charDir == 1 && enemyPos[0] < charPos[0] && enemyPos[0] > charPos[0] - 32
        && enemyPos[1] < charPos[1] + 16 && enemyPos[1] > charPos[1] - 16)
        ||
          (charDir == 3 && enemyPos[0] < charPos[0] + 16 && enemyPos[0] > charPos[0] - 16
        && enemyPos[1] < charPos[1] && enemyPos[1] > charPos[1] - 48)
        )
        {

          let dmg = 2;

          if(statsConc[0][4] - statsConc[1][5] > 1)
          {
            dmg = statsConc[0][4] - statsConc[1][5];
          }

          if(enemiesStats[connectedOnServerId][i][1] - dmg > 0)
          {
            enemiesStats[connectedOnServerId][i][1] -= dmg;
          }
          else
          {

            // Give xp and gold

            let currentLvl = Math.floor(Math.pow(charactersStats[connectedOnServerId][connectedOnCharId][9] / 500, 2/3));

            charactersStats[connectedOnServerId][connectedOnCharId][9] +=
            enemiesDBStats[enemiesSpece[connectedOnServerId][i]][9];

            let newLvl = Math.floor(Math.pow(charactersStats[connectedOnServerId][connectedOnCharId][9] / 500, 2/3));

            // Check if level up

            if( newLvl > currentLvl )
            {

              // Then lvl up

              charactersStats[connectedOnServerId][connectedOnCharId][10] += newLvl - currentLvl;

            }

            // Death et respawn

            enemiesStats[connectedOnServerId][i][1] = enemiesStats[connectedOnServerId][i][0];

            let id = enemiesSpece[connectedOnServerId][i];

            enemiesPosition[connectedOnServerId][i] =
            [
              Math.round( enemiesNonQuantStats[id][3][0][0] + Math.random() * (enemiesNonQuantStats[id][3][0][1] -
                enemiesNonQuantStats[id][3][0][0]) ),
              Math.round( enemiesNonQuantStats[id][3][1][0] + Math.random() * (enemiesNonQuantStats[id][3][1][1] -
                enemiesNonQuantStats[id][3][1][0]) )
            ];

            enemiesTarget[connectedOnServerId][i] = 999;

          }

          if(charDir == 0)
          {
            enemiesDirection[connectedOnServerId][i] = 3;
          }

          if(charDir == 1)
          {
            enemiesDirection[connectedOnServerId][i] = 2;
          }

          if(charDir == 2)
          {
            enemiesDirection[connectedOnServerId][i] = 1;
          }

          if(charDir == 3)
          {
            enemiesDirection[connectedOnServerId][i] = 0;
          }

          enemiesTarget[connectedOnServerId][i] = connectedOnCharId;

          enemiesActionState[connectedOnServerId][i] = 2;

        }

      }

      // NPC talk

      for(let i = 0; i < npcsName[connectedOnServerId].length; i++)
      {

        let npcPos = npcsPosition[connectedOnServerId][i];

        let charPos = charactersPosition[connectedOnServerId][connectedOnCharId];

        let charDir = charactersDirection[connectedOnServerId][connectedOnCharId];

        if(
          (charDir == 0 && npcPos[0] < charPos[0] + 16 && npcPos[0] > charPos[0] - 16
        && npcPos[1] < charPos[1] + 32 && npcPos[1] > charPos[1])
        ||
          (charDir == 2 && npcPos[0] < charPos[0] + 32 && npcPos[0] > charPos[0]
        && npcPos[1] < charPos[1] + 16 && npcPos[1] > charPos[1] - 16)
        ||
          (charDir == 1 && npcPos[0] < charPos[0] && npcPos[0] > charPos[0] - 32
        && npcPos[1] < charPos[1] + 16 && npcPos[1] > charPos[1] - 16)
        ||
          (charDir == 3 && npcPos[0] < charPos[0] + 16 && npcPos[0] > charPos[0] - 16
        && npcPos[1] < charPos[1] && npcPos[1] > charPos[1] - 48)
        )
        {

          message(npcsName[connectedOnCharId][i] + " : " + npcsStats[connectedOnServerId][i][0]);

          if(charDir == 0)
          {
            npcsDirection[connectedOnServerId][i] = 3;
          }

          if(charDir == 1)
          {
            npcsDirection[connectedOnServerId][i] = 2;
          }

          if(charDir == 2)
          {
            npcsDirection[connectedOnServerId][i] = 1;
          }

          if(charDir == 3)
          {
            npcsDirection[connectedOnServerId][i] = 0;
          }

        }

      }

      // Item drop

    });

      // Spell

    socket.on('launchSpell', function(data){

      for(let i = 0; i < spellsSpece[connectedOnServerId].length; i++)
      {

        if(spellsSpece[connectedOnServerId][i] == 999 &&
          charactersStats[connectedOnServerId][connectedOnCharId][3] >= spellsDBstats[data[2]][6])
        {

          charactersStats[connectedOnServerId][connectedOnCharId][3] -= spellsDBstats[data[2]][6];

          let pos = charactersPosition[connectedOnServerId][connectedOnCharId];

          let dir = charactersDirection[connectedOnServerId][connectedOnCharId];

          let str = charactersStats[connectedOnServerId][connectedOnCharId][4];

          let mag = charactersStats[connectedOnServerId][connectedOnCharId][6];

          spellsSpece[connectedOnServerId][i] = data[2];

          spellsPosition[connectedOnServerId][i] = pos;

          spellsDirection[connectedOnServerId][i] = dir;

          spellsActionState[connectedOnServerId][i] = 0;

          spellsOwner[connectedOnServerId][i] = connectedOnCharId;

          spellsDmg[connectedOnServerId][i] =
          spellsDBstats[data[2]][4][0] +
          spellsDBstats[data[2]][4][1] * (spellsDBstats[data[2]][3] == 0) +
          spellsDBstats[data[2]][4][1] * str * (spellsDBstats[data[2]][3] == 1) +
          spellsDBstats[data[2]][4][1] * mag * (spellsDBstats[data[2]][3] == 2);

          spellsLifeTimer[connectedOnServerId][i] = 0;

          break;

        }

      }

    });

      // Level up stat

    socket.on('level_up_stat', function(data){

      if(data[2] <= 1)
      {
        charactersStats[data[0]][data[1]][data[2] * 2] += statProgression[0];
      }

      if(data[2] >= 2)
      {
        charactersStats[data[0]][data[1]][data[2] + 2] += statProgression[1];
      }

      charactersStats[data[0]][data[1]][10]--;

    });

      // functions

      function message(content)
      {

        let data = content;

        socket.emit('message', content);

      }

      function openQuest(quesId)
      {

      }

  }

}

io.sockets.on('connection', OnConnection);  // Execute this function when someone connects

console.log("Server launched");
