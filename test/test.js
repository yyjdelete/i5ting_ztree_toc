var undef;

// Some shims for IE
if (!Object.keys) {
    Object.keys = function(obj) {
        var arr = [];
        for (var key in obj) {
            arr.push(key);
        }

        return arr;
    };
}


var opts = {
	step: 100
}

QUnit.test("encode_id_with_array ", function(assert) {
	var r1 = encode_id_with_array(opts,[1 ]);
	assert.equal( r1, 1, "[1] = 1 = 1 = 1");
	
	var r1_2 = encode_id_with_array(opts,[2 ]);
	assert.equal( r1_2, 2, "[2] = 2 = 2 = 2");
	
	var r2 = encode_id_with_array(opts,[1 ,1]);
	assert.equal( r2, 101, "[1 ,1 ] = 1.1 =  1*100 + 1 = 101");
	 
	var r2_2 = encode_id_with_array(opts,[1 ,2]);
	assert.equal( r2_2, 102, "[1 ,2] = 1.2 =  1*100 + 2 = 102");
	
	var r2_3 = encode_id_with_array(opts,[2 ,3]);
	assert.equal( r2_3, 203, "[2 ,3] = 2.3 =  2*100 + 3 = 203");
	
	var r3 = encode_id_with_array(opts,[1 ,1 ,1]);      
	assert.equal( r3, 10101, "[1 ,1 ,1] = 1.1.1 = 1*100*100 + 1*100 + 1 = 10101");
	
	var r3_2_3 = encode_id_with_array(opts,[1 ,2 ,3]);
	assert.equal( r3_2_3, 10203, "[1 ,2, 3] = 1.2.3 =  1*100*100 + 2*100 + 3= 10203");
});


QUnit.test("get_parent_id_with_array ", function(assert) {
	var r1 = get_parent_id_with_array(opts,[1]);
	assert.equal( r1, 0, "[1] pid = 0");
	
	var r1_2 = get_parent_id_with_array(opts,[2 ]);
	assert.equal( r1_2, 0, "[2] pid = 0");
	
	var r2 = get_parent_id_with_array(opts,[1 ,1]);
	assert.equal( r2, 1, "[1 ,1] pid = 1");
	 
	var r2_2 = get_parent_id_with_array(opts,[1 ,2]);
	assert.equal( r2_2, 1, "[1 ,2] pid = 1");
	
	var r3 = get_parent_id_with_array(opts,[1 ,1 ,1]);      
	assert.equal( r3, 101, "[1 ,1 ,1] pid = 101");
	
	var r3_2_3 = get_parent_id_with_array(opts,[1 ,2 ,3]);
	assert.equal( r3_2_3, 102, "[1 ,2, 3] pid = 102");
	
	var r3_2_3_1 = get_parent_id_with_array(opts,[2 ,3 ,1]);
	assert.equal( r3_2_3_1, 203, "[2, 3, 1] pid = 203");
});

QUnit.test("factor util method", function(assert) {
	var r3 = factor(opts,3,1);
	var r2 = factor(opts,2,1);

	assert.equal( r3, 100*100, "m(opts,3) = 100*100");
	assert.equal( r2, 100, "m(opts,2) = 100");
});
