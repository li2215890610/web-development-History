/// 代码来源 http://www.xiaoboy.com
var $Cookie = {
    get: function (name) {
        var name = name.replace('.', '\\.')
        var reg = new RegExp(" " + name + "=[\\S^;]*", "g");
        var arr = (" " + document.cookie + ";").match(reg);
        if (arr === null) return null;
        return decodeURIComponent(arr[0].replace(/^.*=/, '').slice(0, -1));
    },
    set: function (name, value, expires, path, domain, secure) {
        var today = new Date();
        today.setTime(today.getTime());
        if (expires) {
            expires = expires * 1000 * 60 * 60 * 24;
        }
        var expires_date = new Date(today.getTime() + (expires));
        document.cookie = name + "=" + escape(value) + ((expires) ? ";expires=" +
            expires_date.toGMTString() : "") + ((path) ? ";path=" +
                path : "") + ((domain) ? ";domain=" + domain : "") +
            ((secure) ? ";secure" : "");
    }
};

/// 浏览器支持localStorage则存到localStorage，或则存到cookie中
var $LocalData = {
    supportStorage: !!window.localStorage,
    set: function (key, d) {
        this.supportStorage ? localStorage.setItem(key, d) : $Cookie.set(key, d, 365, '/');
    },
    get: function (key) {
        var data = this.supportStorage ? localStorage.getItem(key) : $Cookie.get(key);
        data = data || '100,200,500,1000,5000|1';
        if (data == null) return false;
        var data = data.split('|');
        return {
            vals: data[0].split(','),
            status: data[1]
        };
    }
}

var listData = [],
    statusInfo = {
        on: 'btn btn-mini btn-green',
        off: 'btn btn-mini btn-red',
        onTxt: '已启用',
        offTxt: '已禁用'
    }, dataArr = $LocalData.get("diySum");
for (var i = 0, len = dataArr.vals.length; i < len; i++) {
    listData.push({
        val: ko.observable(dataArr.vals[i]),
        show: ko.observable(len == (i + 1))
    });
}

var viewModel = {
    list: ko.observableArray(listData),
    remove: function (data, event) {
        if (viewModel.list().length == 1) {
            tip("至少要保留一项");
            return false;
        }
        viewModel.list.remove(data);
        debugger
        viewModel.list.push({
            val: viewModel.list.pop().val,
            show: ko.observable(true)
        });
    },
    add: function (data, event) {
        if (data.val() == "") {
            tip("您有一项未填");
            return false;
        };
        if (viewModel.list().length >= 5) {
            tip("最多只能设置5个");
            return false;
        };
        data.show(false);
        viewModel.list.push({
            val: ko.observable(''),
            show: ko.observable(true)
        });
    },
    save: function (data, event) {
        var arr = [], d, list = this.list();
        for (var i = 0, len = list.length; i < len; i++) {
            list[i].val() != "" && arr.push(list[i].val());
        }
        d = arr.join(',') + '|' + (this.status() ? 1 : 0);
        if (arr.join(',') == dataArr.vals) {
            tip("金额没有更改");
            return false;
        }
        $LocalData.set("diySum", d);
        tip("保存成功", 3000);
    },
    status: ko.observable(dataArr.status == 1),
    statusTxt: ko.observable(dataArr.status == 1 ? statusInfo.onTxt : statusInfo.offTxt),
    statusColor: ko.observable(dataArr.status == 1 ? statusInfo.on : statusInfo.off),
    changeStatus: function () {
        var status = !this.status();
        this.status(status);
        this.statusTxt(status ? statusInfo.onTxt : statusInfo.offTxt);
        this.statusColor(status ? statusInfo.on : statusInfo.off);
        var data = $LocalData.get("diySum");
        $LocalData.set("diySum", data.vals + '|' + (status ? 1 : 0));
        tip("状态设置成功", 3000);
    },
    close: function () {
        //document.getElementById("DiySum").style.display="none";
        window.location.href = "http://www.xiaoboy.com";
    },
    tip: ko.observable()
};

function tip(msg, t) {
    viewModel.tip(msg);
    setTimeout(function () {
        viewModel.tip('');
    }, t || 1500);
}

ko.applyBindings(viewModel, document.getElementById("DiySum"));