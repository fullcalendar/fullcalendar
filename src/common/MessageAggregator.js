
function buildMessageAggregator(parent, initName, destroyName) {
	var childCnt = 0;
	var reportCnt = 0;


	parent.on(initName, up);
	parent.on('before:' + destroyName, down);


	function addChild(child) {
		child.on('all:' + initName, up);
		child.on('before:all:' + destroyName, down);
		childCnt++;
	}


	function up() {
		if (++reportCnt === childCnt + 1) {
			parent.trigger('all:' + initName);
		}
	}


	function down() {
		if (--reportCnt === childCnt) {
			parent.trigger('before:all:' + destroyName);
		}
	}


	return { addChild: addChild };
}
