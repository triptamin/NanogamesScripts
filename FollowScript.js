let config = {
    followUser: {label: 'User to follow', value: '', type: 'text'},
    maxBetTitle: {
        label:
            "Max bet for script to run, in case user you're following bet too high",
        type: 'title'
    },
    maxBet: {label: 'Max bet ', value: 1000000, type: 'number'},
    maxPayoutTitle: {
        label: "Max payout if user you're following doesnt payout",
        type: 'title'
    },
    maxPayout: {
        label: 'Max payout',
        value: 1000,
        type: 'number'
    }
}
function main() {
    const followUser = config.followUser.value
    const maxPayout = config.maxPayout.value
    const maxBet = config.maxBet.value
    let isPlaying = false
    engine.on('GAME_STARTING', function() {
        if (isPlaying) log.info(`Following ${followUser}`)
    })
    engine.on('GAME_ENDED', function() {
        isPlaying = false
        const lastGame = engine.getHistory()[0]
        if (!lastGame.wager) return
        if (lastGame.cashedAt) {
            log.info(
                `WON : crashed At: ${lastGame.cashedAt/100} , profit: ${
                    lastGame.profit
                }`
            )
        } else log.info('Lost :( ')
    })
    engine.on('GAME_BET', function(player) {
        if (player.userName != followUser) return
        if (currency.minAmount > player.bet) {
            log.info(
                `Bet amount too small.Min bet amount is ${
                    currency.minAmount
                }, currency: ${currency.currencyName}`
            )
            return
        }
        if (maxBet < player.bet) {
            log.info('Reached max bet')
            return
        }
        if (player.bet > currency.amount) {
            log.info('Not enough amount')
            return
        }
        if (
            maxBet > player.bet &&
            currency.amount > player.bet &&
            player.bet > currency.minAmount &&
            !isPlaying &&
            player.userName == followUser
        ) {
            isPlaying = true
            engine.bet(player.bet, maxPayout)
        }
    })
    engine.on('GAME_CASHED', function(player) {
        if (player.userName === followUser) engine.cashOut()
    })
}
