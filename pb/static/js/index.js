var API = (function(baseurl) {

    var whoami = null;

    function init_user() {
        return $.ajax({
            method: 'GET',
            url: '/whoami',
            args: {
                dataType: 'text',
                accepts: {
                    text: "application/json",
                }
            }
        }).done(function(data) {
            whoami = data.user;
        }).fail(function(xhr, status, error) {
            console.error('Error making whoami request:', status, error);
        });
    }

    // method, args, uri
    function request(options) {
        options = options || {};

        var url = baseurl.concat(options.uri || '');

        args = $.extend({
            url: url,
            contentType: false,
            processData: false,
            dataType: 'json',
            type: options.method
        }, options.args);

        return $.ajax(args);
    }

    function _fd(data) {
        var fd;

        if (FormData.prototype.isPrototypeOf(data)) {
            fd = data;
        } else {
            fd = new FormData();
            $.each(data, function(key, value) {
                fd.append(key, value);
            });
        }

        fd.append("tags", whoami);

        return fd;
    }

    function get(uri) {
        return request({
            method: 'GET',
            uri: uri,
            args: {
                dataType: 'text',
                accepts: {
                    text: "application/json",
                }
            }
        });
    }

    function put(data, uri) {
        return request({
            method: 'PUT',
            uri: uri,
            args: {
                data: _fd(data)
            }
        });
    }

    function post(data, uri) {
        return request({
            method: 'POST',
            uri: uri,
            args: {
                data: _fd(data)
            }
        });
    }

    // paste

    function paste_delete(uuid) {

        return request({
            method: 'DELETE',
            uri: uuid
        });
    }

    // url

    function url_post(data) {

        return post(data, 'u');
    }

    //

    return {
        paste: {
            post: post,
            put: put,
            delete: paste_delete,
            get: get,
        },
        url: {
            post: url_post
        },
        init_user,
    }
});


var WWW = (function(undefined) {

    function init() {
        $('#datetime').datetimepicker({
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-compass',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            },
        });
    }

    function alert_new() {

        var alert = $('#stash').find('.alert').clone();
        var target = $('#alert-col');

        target.append(alert);

        return { title: function (title, message, link) {
            var title, strong;
            if (link !== undefined)
                message = $('<a>')
                .attr('href', link)
                .text(message);

            strong = $('<strong>').text(title);
            title = $('<div>').append(strong).append(': ').append(message);

            return alert.append(title);
        }}
    }

    function clear() {

        $('input').val('');
        $('textarea').val('');
        $(':checkbox').parent()
            .removeClass('active');

        $('#content').removeClass('hidden');
        $('#filename').addClass('hidden');

        $('input, button').not('.ignore-disable').prop('disabled', false);
    }

    function select_file() {

        var filename = $('#file-input').prop('files')[0].name;

        $('#content').addClass('hidden');
        $('#filename').removeClass('hidden')
            .children().text(filename);

        $('#shorturl').prop('disabled', true);
    }

    function paste_data(content_only) {

        var file, content,
            fd = new FormData();

        // hmm, could support multiple file uploads at once
        file = $('#file-input').prop('files')[0];
        content = $('#content').val();

        if (file !== undefined)
            fd.append('content', file);
        else
            fd.append('content', content);

        if (content_only == true)
            return fd;

        $('.api-input:checkbox').each(function() {
            var value = + $(this).is(':checked'),
                name = $(this).attr('name');

            if (value)
                fd.append(name, value);
        })

        $('.api-input:text:enabled').each(function() {
            var value = $(this).val(),
                name = $(this).attr('name');

            if (value)
                fd.append(name, value);
        });

        return fd;
    }

    var status_keys = ['status', 'link', 'uuid', 'sunset', 'error'];

    function api_status(data) {

        if (!Object.prototype.isPrototypeOf(data))
            return;

        var alert = alert_new();

        $.each(status_keys, function(index, key) {
            var title,
                value = data[key];

            if (key == 'link')
                alert.title(key, data.url, data.url);

            if (value === undefined)
                return;

            alert.title(key, value);
        });
    }

    function set_uuid(data) {

        var uuid = data.uuid;

        if (uuid === undefined)
            return;

        $('#uuid').val(uuid);
    }

    function set_content(data, xhr) {

        var ct = xhr.getResponseHeader('content-type')
        if (ct.startsWith("text/")) {
            $('#content').val(data);
        } else {
            alert_new().title('status', 'cowardly refusing to display C-T: ' + ct);
        }
    }

    function url_data() {

        return {
            content: $('#content').val()
        }
    }

    function swap_sunset() {
        var sunset = $('#sunset'),
            hidden = sunset.find('input, span.fa'),
            visible = hidden.not('.hidden');

        hidden.removeClass('hidden').prop('disabled', false);
        visible.addClass('hidden').prop('disabled', true);
    }

    return {
        alert: alert,
        clear: clear,
        select_file: select_file,
        paste_data: paste_data,
        url_data: url_data,
        api_status: api_status,
        set_uuid: set_uuid,
        set_content: set_content,
        swap_sunset: swap_sunset,
        init: init
    };
});
