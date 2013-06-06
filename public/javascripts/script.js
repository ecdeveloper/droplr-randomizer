$(document).ready(function()
{
	$("#generate").on('click', function()
	{
		$(this).attr('disabled', 'disabled');
		$("#loader").show();
		$.ajax({
			url: '/generate',
			dataType: 'json'
		})
		.done(function(data)
		{
			$("#loader").hide();
			$("#generate").removeAttr("disabled");
			$("#count").html(data.total_iter);
			$("#droplr").html("<a href='"+ data.url +"'>"+ data.url +"</a><hr>").append(data.html);
		})
	})
})