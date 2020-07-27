odoo.define("dms_field.FieldDMS", function(require) {
    "use strict";

    var relational_fields = require("web.relational_fields");

    var FieldMany2One = relational_fields.FieldMany2One;

    var FieldDMS = FieldMany2One.extend({});

    return FieldDMS;
});
