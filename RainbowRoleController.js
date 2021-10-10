const { Collection, MessageEmbed } = require("discord.js")

const isArr = obj => Object.prototype.toString.call(obj) === "[object Array]"
const isStr = obj => Object.prototype.toString.call(obj) === "[object String]"
const isNum = obj => Object.prototype.toString.call(obj) === "[object Number]"

const RainbowRoleController = class {
    constructor(client, options) {
        const { guilds, colors, speed, logging } = options

        if (!guilds) {
            throw Error("Please set guild id in constructor.")
        } else if (!isArr(guilds)) {
            if (!isStr(guilds))
                throw Error("Please set guild id in constructor.")
            this.guild_ids = [guilds]
        } else {
            this.guild_ids = guilds
        }

        if (!isNum(colors) && !(colors == null)) {
            throw Error("colors must be Number.")
        }

        if (!isNum(speed) && !(speed == null)) {
            throw Error("speed must be Number.")
        } else if (speed < 60000) {
            throw Error("Please set speed below 60.000 sec, if this gets abused your bot might get IP-ban.")
        }
            
        this.client = client

        this._interval = null

        this._roles = new Collection()

        this._place = 0

        this.colors = colors || 7

        this.speed = speed || 60000

        this.logging = logging || false

        this.rainbow = this._createRainbow(this.colors)
    }

    _createRainbow(size) {
        const arr = new Array(size)

        for (let i = 0; i < size; i++) {
            const red = this._sin_toHex(i, (0 * Math.PI * 2) / 3) // 0   deg
            const blue = this._sin_toHex(i, (1 * Math.PI * 2) / 3) // 120 deg
            const green = this._sin_toHex(i, (2 * Math.PI * 2) / 3) // 240 deg

            arr[i] = "#" + red + green + blue
        }

        return arr
    }

    _sin_toHex(i, phase) {
        const sin = Math.sin((Math.PI / this.size) * 2 * i + phase)
        const int = Math.floor(sin * 127) + 128
        const hex = int.toString(16)

        return hex.length === 1 ? "0" + hex : hex
    }

    _getRole(id) {
        const roles = []

        for (const guild of this.guild_ids) {
            const server = this.client.guilds.cache.get(guild)

            if (!server) return console.log(`[RainbowRole] Server ${id} was not found.`)

            const role =
                guild.roles.cache.get(id) ||
                guild.roles.cache.find(r => r.name === id)

            if (!role && this.logging) return console.log(`[RainbowRole] Role ${id} was not found in ${guild.id}.`)

            const registered_roles = this._roles.get(role.guild.id)

            if (registered_roles.includes(role.id)) return console.log(`[RainbowRole] Role ${role.id} has already registered.`)

            roles.push([role.guild.id, role.id])
        }

        return roles
    }

    _getRoles() {
        return new Promise((resolve, reject) => {
            const current_roles = []
            const roles_id = this._roles.values()

            for (const role of roles_id) {
                const guild = this.client.guilds.cache.get(role.guild.id)
                const new_role = guild.roles.cache.get(role)
                current_roles.push(new_role)
            }

            resolve(current_roles)
        })
    }

    addRole(role) {
        if (!isStr(role)) return console.log("role must be String.")

        const roles = this._getRole(role)

        roles.forEach(([guild, role]) => {
            const registered_roles = this._roles.get(guild)
            this._roles.set(guild, [...registered_roles, role])
        })

        return this
    }

    addRoles(roles) {
        if (!isArr(roles)) return console.log("args must be Array.")

        roles.forEach(r => this.addRole(r))

        return this
    }

    removeRole(id) {
        if (!isStr(id)) return console.log("role id must be String.")

        const roles = this._getRole(id)

        roles.forEach(([guild, role]) => {
            const registered_roles = this._roles.get(guild)
            if (!registered_roles.includes(role))
                return console.log("role is not registered.")
            this._roles.set(guild, registered_roles.filter(r => r !== role))
        })

        return this
    }

    removeRoles(ids) {
        if (!isArr(ids)) return console.log("args must be Array.")

        ids.forEach(r => this.removeRole(r))

        return this
    }

    changeRoleColor() {
        if (this._roles.size === 0)
            throw Error('Use "addRole" or "addRoles" method, before use "changeRoleColor"')
        if (this._interval !== null)
            throw Error('Interval is already registered, use "stop" method before use "changeRoleColor"')
        
        const setRoleColor = roles => roles.forEach(role => role.setColor(this.rainbow[this._place]).catch(console.error))
        const logging = roles => {
            if (this.logging) {
                const roles_name = roles.map(r => r.name).join(", ")
                console.log(`[RainbowRole] Changed ${roles_name} color to ${this.rainbow[this._place]}`)
            }
        }
        const changeColor = () => {
            if (this._place == this.colors - 1) {
                this._place = 0
            } else {
                this._place++
            }
        }
        
        this._getRoles()
            .then(roles => setRoleColor(roles))
            .then(roles => logging())
            .then(() => changeColor())

        return this
    }

    run() {
        if (this._interval !== null)
            throw Error('"run" method is already used, please use "stop" method then use it.')

        const interval = setInterval(() => this.changeRoleColor(), this.speed)

        this._interval = interval

        return this
    }

    stop() {
        if (this._interval === null)
            throw Error('Use the "run" method, please register the Interval.')

        clearInterval(this._interval)

        this._interval = null

        return this
    }
}

module.exports = RainbowRoleController
