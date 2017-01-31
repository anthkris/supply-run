var SupRun = SupRun || {};

SupRun.game = new Phaser.Game(1920, 1080, Phaser.CANVAS);

SupRun.game.global = {
	 muteAudio: function() {
		 if (SupRun.game.adventureMusic.isPlaying === true) {
			 SupRun.game.adventureMusic.stop();
		 	 SupRun.game.audioButton.frame = 'audioOff.png';
		 } else if (SupRun.game.adventureMusic.isPlaying === false) {
			 SupRun.game.audioButton.frame = 'audioOn.png';
			 SupRun.game.adventureMusic.play();
		 } 
	 }
};

SupRun.game.state.add('Boot', SupRun.BootState);
SupRun.game.state.add('Preload', SupRun.PreloadState);
SupRun.game.state.add('Menu', SupRun.MenuState);
SupRun.game.state.add('Mission', SupRun.MissionState);
SupRun.game.state.add('Game', SupRun.GameState);
SupRun.game.state.add('GameOver', SupRun.GameOverState);

SupRun.game.state.start('Boot');
