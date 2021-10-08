

;( function ( document, window, index )
{
    // feature detection for drag&drop upload
    var isAdvancedUpload = function()
    {
        var div = document.createElement( 'div' );
        return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
    }();


    // applying the effect for every form
    var forms = document.querySelectorAll( '.box' );
    Array.prototype.forEach.call( forms, function( form )
    {
        var input		 = form.querySelector( 'input[type="file"]' ),
            label		 = form.querySelector( 'label' ),
            droppedFiles = false,
            uploadFiles  = false,
            showFiles	 = function( files )
            {
                label.textContent = files.length > 1 ? ( input.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', files.length ) : files[ 0 ].name;
            };

        // letting the server side to know we are going to make an Ajax request
        var ajaxFlag = document.createElement( 'input' );
        ajaxFlag.setAttribute( 'type', 'hidden' );
        ajaxFlag.setAttribute( 'name', 'ajax' );
        ajaxFlag.setAttribute( 'value', 1 );
        form.appendChild( ajaxFlag );

        // automatically submit the form on file select
        input.addEventListener( 'change', function( e )
        {
            showFiles( e.target.files );
            droppedFiles = e.target.files;
            uploadFiles = true;
        });

        // drag&drop files if the feature is available
        if( isAdvancedUpload )
        {
            form.classList.add( 'has-advanced-upload' ); // letting the CSS part to know drag&drop is supported by the browser

            [ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event )
            {
                form.addEventListener( event, function( e )
                {
                    // preventing the unwanted behaviours
                    e.preventDefault();
                    e.stopPropagation();
                });
            });
            [ 'dragover', 'dragenter' ].forEach( function( event )
            {
                form.addEventListener( event, function()
                {
                    form.classList.add( 'is-dragover' );
                });
            });
            [ 'dragleave', 'dragend', 'drop' ].forEach( function( event )
            {
                form.addEventListener( event, function()
                {
                    form.classList.remove( 'is-dragover' );
                });
            });
            form.addEventListener( 'drop', function( e )
            {
                droppedFiles = e.dataTransfer.files; // the files that were dropped
                showFiles( droppedFiles );
            });
        }


        // if the form was submitted
        $('#upload').click(function(e){
            if( droppedFiles || uploadFiles ) {
                // preventing the duplicate submissions if the current one is in progress
                if(droppedFiles.length > 1)
                {
                    $('#alert-modal-title').html('Upload Failure!');
                    $('#alert-modal-body').html('Please select only one image.');
                    $('#alert-modal').modal('show');
                }
                else
                {
                    compressImage(droppedFiles[0]);
                }
            }
            else
            {
                $('#alert-modal-title').html('Upload Failure!');
                $('#alert-modal-body').html('Please select a image before attempting to upload.');
                $('#alert-modal').modal('show');
            }
        });

        // Firefox focus bug fix for file input
        input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
        input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

    });
}( document, window, 0 ));

(function(e,t,n){var r=e.querySelectorAll("html")[0];r.className=r.className.replace(/(^|\s)no-js(\s|$)/,"$1js$2")})(document,window,0);

function compressImage (file) {
    var options = {
        maxSizeMB: file.size / 1024 / 1024 / 5,
        maxWidthOrHeight: 1024
    }
    imageCompression(file, options)
        .then(function (output) {
            var zip = new JSZip();
            document.getElementsByClassName("content")[0].style.display = "block";
            document.getElementById("original-image").href = URL.createObjectURL(file);
            document.getElementById("compressed-image").href = URL.createObjectURL(output);
            zip.file('original.'+file.name.split('.')[1], file);
            zip.file('compressed.'+file.name.split('.')[1], output);
            zip.generateAsync({type:"blob"})
                .then(function (blob) {
                    document.getElementById("download-zip").href = URL.createObjectURL(blob);
                });

        })
        .catch(function (error) {
            alert(error.message)
        })

}
