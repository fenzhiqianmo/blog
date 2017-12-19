function Promise(executor) {
	var self = this
	self.resolvedCallbacks = []
	self.rejectedCallbacks = []
	self.status = 'pending'
	function resolve(value) {
		if (self.status === 'pending') {
			self.status = 'resolved'
		}
		self.data = value
		for(var i = 0; i < self.resolvedCallbacks.length; i++) {
			var f = self.resolvedCallbacks[i]
			f(value)
		}
	}
	function reject(reason) {
		if (self.status === 'pending') {
			self.status = 'rejected'
		}
		self.data = reason
		for(var i = 0; i < self.rejectedCallbacks.length; i++) {
			var f = self.rejectedCallbacks[i]
			f(reason)
		}
	}
	try {
		executor(resolve, reject)
	} catch(e) {
		reject(e)
	}
}

Promise.prototype.then = function (onResolved, onRejected) {
	var self = this
	if (typeof onResolved !== 'function') {
		onResolved = function () {}
	}
	if (typeof onRejected !== 'function') {
		onRejected = function () {}
	}
	// 核心处理
	var promise2
	if (self.status === 'resolved') {
		promise2 = new Promise(function(resolve, reject) {
			try {
				var x = onResolved(self.data)
				if (x instanceof Promise) {
					x.then(resolve, reject)
				} else {
					resolve(x)
				}
			} catch(e) {
				reject(e)
			}
		})
	}

	if (self.status === 'rejected') {
		promise2 = new Promise(function(resolve, reject) {
			try {
				var x = onRejected(self.data)
				if (x instanceof Promise) {
					x.then(resolve, reject)
				} else {
					resolve(x)
				}
			} catch(e) {
				reject(e)
			}
		})
	}

	if (self.status === 'pending') {
		promise2 = new Promise(function(resolve, reject) {
			self.resolvedCallbacks.push(function(value) {
				try {
					var x = onResolved(value)
					if (x instanceof Promise) {
						x.then(resolve, reject)
					} else {
						resolve(x)
					}
				} catch(e) {
					reject(e)
				}
			})
			self.rejectedCallbacks.push(function(reason) {
				try {
					var x = onRejected(reason)
					if (x instanceof Promise) {
						x.then(resolve, reject)
					} else {
						resolve(x)
					}
				} catch(e) {
					reject(e)
				}
			})
		})
	} 

	return promise2
}

// 用于测试
Promise.deferred = function () {
	var dfd = {}
	dfd.promise = new Promise(function(resolve, reject) {
		dfd.resolve = resolve
		dfd.reject = reject
	})
	return dfd
}

module.exports = Promise