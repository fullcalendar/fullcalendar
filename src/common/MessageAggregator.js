
function buildMessageAggregator(parent, initName, destroyName) {
	var childUpEvent = 'all:' + initName;
	var childDownEvent = 'before:all:' + destroyName;
	var childCnt = 0;
	var reportCnt = 0;


	parent.on(initName, up);
	parent.on('before:' + destroyName, down);


	function addChild(child) {
		child.on(childUpEvent, up);
		child.on(childDownEvent, down);
		childCnt++;
	}


	function removeChild(child) {
		child.off(childUpEvent, up);
		child.off(childDownEvent, down);
		childCnt--;
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


	return { addChild: addChild, removeChild: removeChild };
}

FC.buildMessageAggregator = buildMessageAggregator;
