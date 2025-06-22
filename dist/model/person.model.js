"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = void 0;
const gen_model_1 = require("./gen.model");
class Person extends gen_model_1.GenModel {
    id;
    firstName;
    lastName;
    email;
    phone;
    constructor() {
        super();
    }
}
exports.Person = Person;
//# sourceMappingURL=person.model.js.map