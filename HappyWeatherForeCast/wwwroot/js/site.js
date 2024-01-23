$(document).ready(function () {
    var isSidebarExpanded = false; // Tracks the sidebar state

    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        isSidebarExpanded = !isSidebarExpanded; // Toggle the state

        // Toggle icons and text
        $(this).find('.fa-bars, .fa-times').toggle();
        $(this).find('.toggle-text').toggle();

        if (isSidebarExpanded) {
            $("#wrapper").removeClass("toggled");
            $("#sidebar-wrapper").css("width", "400px");
        } else {
            $("#wrapper").addClass("toggled");
            $("#sidebar-wrapper").css("width", "50px");
        }
    });

    $("#sidebar-wrapper").hover(
        function () {
            // Only expand on hover if sidebar is collapsed and not expanded by toggle
            if (!isSidebarExpanded) {
                $(this).css("width", "400px");
            }
        },
        function () {
            // Only collapse on mouseout if sidebar is collapsed and not expanded by toggle
            if (!isSidebarExpanded) {
                $(this).css("width", "50px");
            }
        }
    );
});
