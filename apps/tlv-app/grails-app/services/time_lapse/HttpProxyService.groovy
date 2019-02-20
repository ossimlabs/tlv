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

        def keyStoreFile = new File( 'keyStore.jks' )
        def trustStoreFile = new File( 'trustStore.jks' )

		if ( keyStoreFile && trustStoreFile ) {
            def keyStore = KeyStore.getInstance( KeyStore.defaultType )
            keyStoreFile.withInputStream { stream ->
                keyStore.load( stream, 'tlv123'.toCharArray() )
            }

            def trustStore = KeyStore.getInstance( KeyStore.defaultType )
			trustStoreFile.withInputStream { stream ->
                trustStore.load( stream, 'tlv123'.toCharArray() )
            }

			def ssl = new SSLSocketFactory( keyStore, 'tlv123', trustStore )
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
