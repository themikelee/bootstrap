# <%= version%> (<%= today%>)

## Features

<% _(changelog.feat).forEach(function(changes, directive) { %>### <%= directive%>
<% changes.forEach(function(change) { %>
* <%= change.msg%> (<%= change.sha1%>)
<% }) %>
<% }) %>
## Bug fixes

<% _(changelog.fix).forEach(function(changes, directive) { %>### <%= directive%>
<% changes.forEach(function(change) { %>
* <%= change.msg%> (<%= change.sha1%>)
<% }) %>
<% }) %>