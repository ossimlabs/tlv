package time_lapse

import grails.transaction.Transactional
import static groovyx.net.http.ContentType.TEXT
import groovyx.net.http.HTTPBuilder
import static groovyx.net.http.Method.GET
import java.security.KeyStore
import org.apache.http.conn.scheme.Scheme
import org.apache.http.conn.ssl.SSLSocketFactory


@Transactional
class HttpProxyService {

    def grailsApplication


	def serviceMethod( url ) {
		def http = new HTTPBuilder( url )

        def keyStoreFile = getClass().getResource( '/keyStore.jks' )
        def keyStorePassword = grailsApplication.config.keyStores.keyStore.password
        def trustStoreFile = getClass().getResource( '/trustStore.jks' )
        def trustStorePassword = grailsApplication.config.keyStores.trustStore.password

		if ( keyStoreFile && trustStoreFile ) {
            def keyStore = KeyStore.getInstance( KeyStore.defaultType )
            keyStoreFile.withInputStream {
                keyStore.load( it, keyStorePassword.toCharArray() )
            }

            def trustStore = KeyStore.getInstance( KeyStore.defaultType )
			trustStoreFile.withInputStream {
                trustStore.load( it, trustStorePassword.toCharArray() )
            }

			def ssl = new SSLSocketFactory( keyStore, keyStorePassword, trustStore )
			http.client.connectionManager.schemeRegistry.register( new Scheme( 'https', ssl, 443 ) )
		}

		try {
            http.request( GET, TEXT ) { req ->
				response.failure = { resp, reader ->
                    println 'Failure: ${reader}'


					return null
				}
				response.success = { resp, reader ->


					return reader.text
				}
			}
		}
		catch ( Exception event ) {
			println event
			return null
		}
	}
}
