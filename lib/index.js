'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _child_process = require('mz/child_process');

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _process$argv = _slicedToArray(process.argv, 3);

const option = _process$argv[2];


if (option) {
	if (['-v', '--version'].includes(option)) {
		console.log(`v${_package.version}`);
		process.exit(0);
	} else if (['-h', '--help'].includes(option)) {
		console.log(`Just run \`${_chalk2.default.blue('git-add')}\` to start the magic.`);
		process.exit(0);
	}
}

const execCommand = (() => {
	var _ref2 = _asyncToGenerator(function* (_ref) {
		let resets = _ref.resets,
		    files = _ref.files,
		    commit = _ref.commit;

		const resetCommand = `git reset ${resets.join(' ')}`;
		const addCommand = `git add ${files.join(' ')}`;
		const commitCommand = `git commit -m ${JSON.stringify(commit)}`;
		const excapeStr = function (str) {
			return str.replace(/`/g, '\\`');
		};

		const commands = [resetCommand, addCommand].map(excapeStr);

		var _ref3 = yield (0, _child_process.exec)(commands.join(' && ')),
		    _ref4 = _slicedToArray(_ref3, 2);

		const result = _ref4[0],
		      stderr = _ref4[1];


		if (stderr) {
			throw new Error(stderr);
		}
		console.log(result);
	});

	return function execCommand(_x) {
		return _ref2.apply(this, arguments);
	};
})();

const select = (() => {
	var _ref5 = _asyncToGenerator(function* (list) {
		var _ref6 = yield _inquirer2.default.prompt([{
			type: 'checkbox',
			name: 'files',
			message: 'git add',
			choices: list
		}]);

		const files = _ref6.files,
		      other = _objectWithoutProperties(_ref6, ['files']);

		const resets = list.filter(function (_ref7) {
			let checked = _ref7.checked;
			return checked;
		}).filter(function (_ref8) {
			let value = _ref8.value;
			return files.every(function (file) {
				return file !== value;
			});
		}).map(function (_ref9) {
			let value = _ref9.value;
			return value;
		});

		yield execCommand(_extends({ files, resets }, other));
	});

	return function select(_x2) {
		return _ref5.apply(this, arguments);
	};
})();

const start = (() => {
	var _ref10 = _asyncToGenerator(function* () {
		const parseRegExp = /^(.)(.)\s+?(.*)$/;

		var _ref11 = yield (0, _child_process.exec)('git status -s'),
		    _ref12 = _slicedToArray(_ref11, 2);

		const listStr = _ref12[0],
		      stderr = _ref12[1];


		if (stderr) {
			throw new Error(stderr);
		}

		if (!listStr) {
			return;
		}

		const list = listStr.split('\n').filter(Boolean).map(function (line) {
			var _parseRegExp$exec = parseRegExp.exec(line),
			    _parseRegExp$exec2 = _slicedToArray(_parseRegExp$exec, 4);

			const codeX = _parseRegExp$exec2[1],
			      codeY = _parseRegExp$exec2[2],
			      fileName = _parseRegExp$exec2[3];

			const hasAdded = !/[!?]/.test(codeX);
			const styledCodeX = _chalk2.default[hasAdded ? 'green' : 'red'](codeX);
			const styledCodeY = _chalk2.default.red(codeY);
			const checked = hasAdded && !codeY.trim();
			return {
				checked,
				value: fileName,
				name: `${styledCodeX}${styledCodeY} ${fileName}`
			};
		});

		yield select(list);
	});

	return function start() {
		return _ref10.apply(this, arguments);
	};
})();

start().catch(err => console.error(err.message));