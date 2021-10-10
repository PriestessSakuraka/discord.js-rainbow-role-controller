# discord.js-rainbow-role-controller

# Features

Change color of role on discord periodically.

# Requirements

* Discord.js v12.2.0 or later (v13.2.0)

# Usage

Please create javascript code named "RainbowRoleController".
And copy &amp; paste [code](https://github.com/PriestessSakuraka/discord.js-rainbow-role-controller/blob/main/RainbowRoleController.js),
then use import or require to get module.

# Example of usage

```js
const { Client, Intents } = require("discord.js")
const { RainbowRoleController } = require("./RainbowRoleController.js")

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.on("ready", () => {
    const controller = new RainbowRoleController(client, {
        guilds: "guild_id",
        colors: 7,
        speed: 60000,
        logging: true
    })
    
    controller.addRoles(["Member", "Rainbow", "0123456789"])
    
    controller.run()
        .catch(console.error)
})

client.login()
```

# Note

This code is not debugged completely. It might be still has some problems.
