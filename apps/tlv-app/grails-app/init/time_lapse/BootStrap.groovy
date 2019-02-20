package time_lapse

class BootStrap {

    def grailsApplication


    def init = { servletContext ->
        def keyStore = grailsApplication.config.keyStores.keyStore
        if ( keyStore.certificate && keyStore.key ) {
            def certificate = new File( 'keyStore.crt' )
            certificate.write( keyStore.certificate )

            def key = new File( 'keyStore.key' )
            key.write( keyStore.key )

            'openssl pkcs12 -export -in keyStore.crt -inkey keyStore.key -out keyStore.p12 -password pass:tlv123'.execute().waitFor()

            // in case the above execution isn't fast enough
            if ( !new File( 'keyStore.p12' ).exists() ) {
                sleep( 100 )
            }
            certificate.delete()
            key.delete()

            'keytool -importkeystore -srckeystore keyStore.p12 -srcstorepass tlv123 -srcstoretype PKCS12 -destkeystore keyStore.jks -deststorepass tlv123 -deststoretype JKS'.execute().waitFor()

            // in case the above execution isn't fast enough
            if ( !new File( 'keyStore.jks' ).exists() ) {
                sleep( 100 )
            }
            new File( 'keyStore.p12' ).delete()
        }

        def trustStore = grailsApplication.config.keyStores.trustStore
        if ( trustStore.certificate ) {
            def certificate = new File( 'trustStore.crt' )
            certificate.write( trustStore.certificate )

            'keytool -importcert -alias tlv -file trustStore.crt -keystore trustStore.jks -noprompt -storepass tlv123'.execute().waitFor()

            // in case the above execution isn't fast enough
            if ( !new File( 'trustStore.jks' ).exists() ) {
                sleep( 100 )
            }
            certificate.delete()
        }
    }
    def destroy = {
    }
}
